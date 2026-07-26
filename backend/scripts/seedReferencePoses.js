const db = require('../db') 
const { normalizeKeypoints } = require('../utils/normalizeKeypoints') 

db.exec(`
     CREATE TABLE IF NOT EXISTS reference_poses ( 
     id INTEGER PRIMARY KEY AUTOINCREMENT, 
     pose_name TEXT UNIQUE NOT NULL, 
     normalized_keypoints TEXT NOT NULL 
     ) 
   `).catch(err => console.error("Error creating reference_poses table:", err))
     
async function seedPose(poseName, rawLandmarks) { 
    const normalized = normalizeKeypoints(rawLandmarks) 
    await db.prepare(` 
        INSERT INTO reference_poses (pose_name, normalized_keypoints) 
        VALUES (?, ?) 
        ON CONFLICT(pose_name) DO UPDATE SET normalized_keypoints = 
        excluded.normalized_keypoints 
        `).run(poseName, JSON.stringify(normalized))
}

module.exports = { seedPose }