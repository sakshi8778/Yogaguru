// backend/scripts/seedReferencePoses.js
require('dotenv').config()
const db = require('../db')

// Define the list of 13 distinct pose names (user can fill in their actual list here)
const POSES_TO_SEED = [
  "Child's Pose",
  "Downward Dog",
  "Cobra Pose",
  "Warrior 2",
  "Tree Pose",
  "Plank Pose",
  "Bridge Pose",
  "Forward Fold",
  "Cat-Cow",
  "Triangle Pose",
  "Savasana",
  "Warrior 1",
  "Mountain Pose"
];

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

async function run() {
  console.log('[Seed Reference Poses] Starting database seeding of pose images...');

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.error('-> ERROR: process.env.CLOUDINARY_CLOUD_NAME is not defined in the environment.');
    process.exit(1);
  }

  console.log(`[Seed Reference Poses] Using Cloudinary Cloud Name: "${cloudName}"`);
  console.log(`[Seed Reference Poses] Found ${POSES_TO_SEED.length} poses to seed.`);

  for (let i = 0; i < POSES_TO_SEED.length; i++) {
    const name = POSES_TO_SEED[i];
    const slug = slugify(name);
    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${slug}.jpg`;

    console.log(`\n[${i + 1}/${POSES_TO_SEED.length}] Processing "${name}" (slug: "${slug}")...`);

    try {
      // Insert/Update DB
      await db.prepare(`
        INSERT INTO pose_images (pose_name, pose_name_slug, image_url)
        VALUES (?, ?, ?)
        ON CONFLICT (pose_name_slug)
        DO UPDATE SET image_url = excluded.image_url
      `).run(name, slug, imageUrl);

      console.log(`-> Saved/updated in database. URL: ${imageUrl}`);
    } catch (err) {
      console.error(`-> Error processing "${name}":`, err.message || err);
    }
  }

  console.log('\n[Seed Reference Poses] Finished seeding reference pose images.');
  await db.close();
}

run().catch(async (e) => {
  console.error('[Seed Reference Poses] Critical Failure:', e);
  try {
    await db.close();
  } catch (_) {}
});