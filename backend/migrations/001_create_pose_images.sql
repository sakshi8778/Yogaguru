-- migrations/001_create_pose_images.sql
CREATE TABLE IF NOT EXISTS pose_images (
  id SERIAL PRIMARY KEY,
  pose_name TEXT NOT NULL,
  pose_name_slug TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pose_images_slug ON pose_images(pose_name_slug);
