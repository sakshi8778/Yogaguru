
-- Run once against the new Railway Postgres instance to recreate
-- the schema that better-sqlite3 auto-created locally. Postgres syntax
-- differs slightly (SERIAL instead of AUTOINCREMENT, TIMESTAMP instead
-- of TEXT for dates).
CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
age_group TEXT NOT NULL,
health_conditions TEXT DEFAULT '[]',
goals TEXT DEFAULT '[]',
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS plans (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
plan_json TEXT NOT NULL,
created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS reference_poses (
id SERIAL PRIMARY KEY,
pose_name TEXT UNIQUE NOT NULL,
normalized_keypoints TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
average_accuracy REAL,
pose_scores_json TEXT NOT NULL,
completed_at TIMESTAMP DEFAULT NOW()
📝);
