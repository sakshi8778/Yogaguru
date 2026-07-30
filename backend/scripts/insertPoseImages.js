// backend/scripts/insertPoseImages.js
//
// Manually populates the pose_images table with photos you've sourced
// and uploaded to Cloudinary yourself (no Gemini call, no billing needed).
//
// HOW TO USE:
// 1. Upload each pose photo to Cloudinary's Media Library, into the
//    "pose-images" folder, with the Public ID matching the slug shown
//    in the comment next to each pose below.
// 2. Copy the "secure_url" Cloudinary gives you after upload.
// 3. Paste that URL into the matching imageUrl field below.
// 4. Run: node scripts/insertPoseImages.js

require('dotenv').config()
const db = require('../db')

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
}

// ── Fill in imageUrl for each pose after uploading to Cloudinary ──
const POSE_IMAGES = [
    { name: "Child's Pose", imageUrl: '' },              // slug: childs-pose
    { name: 'Downward-Facing Dog', imageUrl: '' },        // slug: downward-facing-dog
    { name: 'Cobra Pose', imageUrl: '' },                 // slug: cobra-pose
    { name: 'Warrior II', imageUrl: '' },                 // slug: warrior-ii
    { name: 'Tree Pose', imageUrl: '' },                  // slug: tree-pose
    { name: 'Plank Pose', imageUrl: '' },                 // slug: plank-pose
    { name: 'Bridge Pose', imageUrl: '' },                // slug: bridge-pose
    { name: 'Forward Fold', imageUrl: '' },               // slug: forward-fold
    { name: 'Cat-Cow Stretch', imageUrl: '' },            // slug: cat-cow-stretch
    { name: 'Triangle Pose', imageUrl: '' },              // slug: triangle-pose
    { name: 'Savasana', imageUrl: '' },                   // slug: savasana
    // Add any remaining poses from your list the same way:
    // { name: 'Pose Name Here', imageUrl: '' },
]

async function run() {
    console.log('--- Starting manual pose image insert ---')

    for (const pose of POSE_IMAGES) {
        const slug = slugify(pose.name)

        if (!pose.imageUrl || pose.imageUrl.trim() === '') {
            console.log(`[SKIPPED] "${pose.name}" — no imageUrl filled in yet.`)
            continue
        }

        try {
            await db.prepare(`
        INSERT INTO pose_images (pose_name, pose_name_slug, image_url)
        VALUES (?, ?, ?)
        ON CONFLICT (pose_name_slug)
        DO UPDATE SET image_url = excluded.image_url
      `).run(pose.name, slug, pose.imageUrl)

            console.log(`[SAVED] "${pose.name}" -> ${pose.imageUrl}`)
        } catch (err) {
            console.error(`[ERROR] Failed to save "${pose.name}":`, err.message)
        }
    }

    console.log('--- Finished ---')
    await db.close()
}

run()