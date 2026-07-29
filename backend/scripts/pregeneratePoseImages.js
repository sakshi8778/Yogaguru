// backend/scripts/pregeneratePoseImages.js
require('dotenv').config()
const db = require('../db')
const { COMMON_POSES } = require('../data/commonPoses')
const { POSES } = require('../utils/posesData')
const { generatePoseImage } = require('../lib/geminiImage')
const { uploadPoseImage } = require('../lib/cloudinary')

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

async function run() {
  console.log('[Batch Pregeneration] Starting pose image pregeneration...');

  const poseInstructionsMap = {};

  // Build dictionary from static poses
  for (const p of POSES) {
    poseInstructionsMap[p.name] = p.instructions;
  }
  for (const p of COMMON_POSES) {
    poseInstructionsMap[p.name] = p.instructions;
  }

  // Best-effort: look up distinct pose names and instructions from plans table
  try {
    const plans = await db.prepare('SELECT plan_json FROM plans').all()
    for (const p of plans) {
      try {
        const parsed = JSON.parse(p.plan_json)
        if (parsed && Array.isArray(parsed.poses)) {
          for (const pose of parsed.poses) {
            if (pose && pose.name) {
              if (!poseInstructionsMap[pose.name]) {
                poseInstructionsMap[pose.name] = pose.instructions || `Focus on correct posture, steady breathing, and balance for ${pose.name}.`;
              }
            }
          }
        }
      } catch (jsonErr) {
        // ignore JSON parse failures for single plans
      }
    }
  } catch (dbErr) {
    console.warn('[Batch Pregeneration] Could not query plans table for custom poses:', dbErr.message);
  }

  const allPoseNames = Object.keys(poseInstructionsMap);
  console.log(`[Batch Pregeneration] Found ${allPoseNames.length} distinct poses to check.`);

  for (let i = 0; i < allPoseNames.length; i++) {
    const name = allPoseNames[i];
    const slug = slugify(name);
    const instructions = poseInstructionsMap[name];

    console.log(`\n[${i + 1}/${allPoseNames.length}] Processing "${name}" (slug: "${slug}")...`);

    try {
      // Check if already exists in DB
      const existing = await db.prepare('SELECT id, image_url FROM pose_images WHERE pose_name_slug = ?').get(slug)
      if (existing) {
        console.log(`-> Already exists in DB. Skipping. URL: ${existing.image_url}`);
        continue;
      }

      // Generate Image
      console.log(`-> Generating image via Gemini...`);
      const imageBuffer = await generatePoseImage(name, instructions);

      // Upload to Cloudinary
      console.log(`-> Uploading to Cloudinary...`);
      const secureUrl = await uploadPoseImage(imageBuffer, slug);
      console.log(`-> Uploaded successfully. URL: ${secureUrl}`);

      // Insert/Update DB
      await db.prepare(`
        INSERT INTO pose_images (pose_name, pose_name_slug, image_url)
        VALUES (?, ?, ?)
        ON CONFLICT (pose_name_slug)
        DO UPDATE SET image_url = excluded.image_url
      `).run(name, slug, secureUrl);
      console.log(`-> Saved in database lookup table.`);

      // Delay to avoid rate limits
      if (i < allPoseNames.length - 1) {
        console.log('-> Waiting 3 seconds before next request...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (err) {
      console.error(`-> Error processing "${name}":`, err.message || err);
      console.log('-> Continuing to next pose in batch...');
    }
  }

  console.log('\n[Batch Pregeneration] Finished batch pregeneration.');
  await db.close();
}

run().catch(async (e) => {
  console.error('[Batch Pregeneration] Critical Failure:', e);
  try {
    await db.close();
  } catch (_) {}
});
