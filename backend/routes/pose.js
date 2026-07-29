const express = require('express') 
const router = express.Router() 
const db = require('../db') 
const { comparePoses } = require('../utils/poseSimilarity') 
const { POSES } = require('../utils/posesData')
const { distance } = require('fastest-levenshtein')
const { uploadPoseImage } = require('../lib/cloudinary')
const { generatePoseImage } = require('../lib/geminiImage')


function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}


// Personalization helper function
function getPersonalizedPoses(user) {
  const ageGroup = user.age_group || 'adult';
  let healthConditions = [];
  let goals = [];
  
  try {
    healthConditions = typeof user.health_conditions === 'string' 
      ? JSON.parse(user.health_conditions || '[]') 
      : (user.health_conditions || []);
  } catch (e) {
    healthConditions = [];
  }

  try {
    goals = typeof user.goals === 'string' 
      ? JSON.parse(user.goals || '[]') 
      : (user.goals || []);
  } catch (e) {
    goals = [];
  }

  // 1. Filter out unsafe poses
  const safePoses = POSES.filter(pose => {
    // Check if any unsafe conditions overlap with user's health conditions
    return !pose.unsafeFor.some(condition => healthConditions.includes(condition));
  });

  // 2. Adjust breath and rep counts based on age group, and customize instructions
  const personalized = safePoses.map(pose => {
    let repMultiplier = 1.0;
    let breathMultiplier = 1.0;
    let ageNote = '';

    if (ageGroup === 'kid') {
      repMultiplier = 0.8;
      breathMultiplier = 0.6;
      ageNote = 'Short, playful hold.';
    } else if (ageGroup === 'teen') {
      repMultiplier = 1.0;
      breathMultiplier = 0.8;
      ageNote = 'Active holding.';
    } else if (ageGroup === 'adult') {
      repMultiplier = 1.2;
      breathMultiplier = 1.2;
      ageNote = 'Steady, balanced breath.';
    } else if (ageGroup === 'old') {
      repMultiplier = 0.8;
      breathMultiplier = 1.5;
      ageNote = 'Gentle hold. Focus on stability and alignment.';
    }

    const durationSeconds = Math.round(pose.baseBreaths * 10 * breathMultiplier);
    const reps = Math.max(1, Math.round(pose.baseReps * repMultiplier));
    const breaths = Math.max(3, Math.round(pose.baseBreaths * breathMultiplier));

    // Customize instructions based on health conditions
    let customInstructions = pose.instructions;
    if (healthConditions.length > 0) {
      const adaptations = [];
      if (healthConditions.includes('back_pain') && pose.name === 'Downward-Facing Dog') {
        adaptations.push('Keep knees slightly bent to protect lower back.');
      }
      if (healthConditions.includes('knee_pain') && pose.name === 'Warrior II') {
        adaptations.push('Keep knee directly over ankle, do not let it bend past 90 degrees.');
      }
      if (healthConditions.includes('neck_pain') && pose.name === 'Bridge Pose') {
        adaptations.push('Do not turn head side to side while in this pose.');
      }
      if (adaptations.length > 0) {
        customInstructions += ` *(Modify: ${adaptations.join(' ')})`;
      }
    }

    return {
      ...pose,
      durationSeconds,
      reps,
      breaths,
      instructions: `${customInstructions} (${ageNote})`
    };
  });

  // 3. Rank the poses based on matching goals
  personalized.sort((a, b) => {
    const aMatchCount = a.focus.filter(f => goals.includes(f)).length;
    const bMatchCount = b.focus.filter(f => goals.includes(f)).length;
    return bMatchCount - aMatchCount; // Descending order of matches
  });

  return personalized;
}

// GET /api/pose/personalized
router.get('/personalized', async (req, res) => {
  const { userId } = req.query;

  try {
    let user = null;
    if (userId) {
      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    }

    if (!user) {
      // Return generic pose list (all safe poses for an average adult)
      const genericUser = { age_group: 'adult', health_conditions: '[]', goals: '[]' };
      const poses = getPersonalizedPoses(genericUser);
      return res.json({ poses });
    }

    const poses = getPersonalizedPoses(user);
    res.json({ poses });
  } catch (err) {
    console.error('Error fetching personalized poses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pose/score // Compares a single frame's live landmarks against the stored reference // for the named pose and returns an accuracy % + one correction hint. 
router.post('/score', async (req, res) => { 
    const { poseName, landmarks } = req.body 
    if (!poseName || !landmarks) { 
        return res.status(400).json({ error: 'poseName and landmarks are required' }) 
    } 
    try {
        const row = await db 
        .prepare('SELECT normalized_keypoints FROM reference_poses WHERE pose_name = ?') 
        .get(poseName) 
        if (!row) { 
            // No reference captured for this pose yet — don't fail the whole // session, just tell the frontend scoring isn't available. 
            return res.json({ accuracy: null, feedback: 'Scoring unavailable for this pose' }) 
        } 
        const referenceNormalized = JSON.parse(row.normalized_keypoints) 
        const result = comparePoses(landmarks, referenceNormalized) 
        res.json(result) 
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
}) 

// GET /api/pose/image/:poseName
router.get('/image/:poseName', async (req, res) => {
  const { poseName } = req.params
  if (!poseName) {
    return res.status(400).json({ error: 'Pose name is required' })
  }

  const slug = slugify(poseName)

  try {
    // 1. Look up an EXACT match on pose_name_slug in pose_images first
    const exactMatch = await db.prepare('SELECT image_url FROM pose_images WHERE pose_name_slug = ?').get(slug)
    if (exactMatch) {
      return res.json({ imageUrl: exactMatch.image_url, source: 'cache' })
    }

    // 2. Do a lightweight fuzzy match against existing pose_name_slug values
    const allImages = await db.prepare('SELECT pose_name_slug, image_url FROM pose_images').all()
    let bestMatch = null
    let minDistance = Infinity
    const MAX_FUZZY_DISTANCE = 3 // Levenshtein threshold

    for (const img of allImages) {
      const dist = distance(slug, img.pose_name_slug)
      if (dist < minDistance) {
        minDistance = dist
        bestMatch = img
      }
    }

    if (bestMatch && minDistance <= MAX_FUZZY_DISTANCE) {
      console.log(`[Fuzzy Match] Reusing image for slug "${slug}" from "${bestMatch.pose_name_slug}" (distance: ${minDistance})`)
      return res.json({ imageUrl: bestMatch.image_url, source: 'fuzzy-match' })
    }

    // 3. Generate live via gemini-2.5-flash-image
    const pose = POSES.find(p => slugify(p.name) === slug)
    const poseInstructions = pose ? pose.instructions : `Focus on correct posture, steady breathing, and balance for ${poseName}.`

    let imageBuffer
    try {
      imageBuffer = await generatePoseImage(poseName, poseInstructions)
    } catch (apiErr) {
      console.error('[Gemini Image Generation Error]:', apiErr)
      return res.status(502).json({ error: 'Could not generate reference image for this pose' })
    }

    // 4. Upload to Cloudinary
    let secureUrl
    try {
      secureUrl = await uploadPoseImage(imageBuffer, slug)
    } catch (cloudErr) {
      console.error('[Cloudinary Upload Error]:', cloudErr)
      return res.status(502).json({ error: 'Could not upload reference image to cloud storage' })
    }

    // 5. Insert into database (ON CONFLICT DO UPDATE on pose_name_slug)
    try {
      await db.prepare(`
        INSERT INTO pose_images (pose_name, pose_name_slug, image_url) 
        VALUES (?, ?, ?) 
        ON CONFLICT (pose_name_slug) 
        DO UPDATE SET image_url = excluded.image_url
      `).run(poseName, slug, secureUrl)
    } catch (dbErr) {
      console.error('[Database Insert Error]:', dbErr)
    }

    return res.json({ imageUrl: secureUrl, source: 'generated' })
  } catch (err) {
    console.error(`[GET /api/pose/image/:poseName] Error:`, err)
    return res.status(500).json({ error: 'Internal server error while retrieving pose image' })
  }
})

module.exports = router

