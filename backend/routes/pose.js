const express = require('express') 
const router = express.Router() 
const db = require('../db') 
const { comparePoses } = require('../utils/poseSimilarity') 
// POST /api/pose/score // Compares a single frame's live landmarks against the stored reference // for the named pose and returns an accuracy % + one correction hint. 
router.post('/score', (req, res) => { 
    const { poseName, landmarks } = req.body 
    if (!poseName || !landmarks) { 
        return res.status(400).json({ error: 'poseName and landmarks are required' }) 
    } 
    const row = db 
    .prepare('SELECT normalized_keypoints FROM reference_poses WHERE pose_name = ?') 
    .get(poseName) 
    if (!row) { 
        // No reference captured for this pose yet — don't fail the whole // session, just tell the frontend scoring isn't available. 
        return res.json({ accuracy: null, feedback: 'Scoring unavailable for this pose' }) 
    } 
    const referenceNormalized = JSON.parse(row.normalized_keypoints) 
    const result = comparePoses(landmarks, referenceNormalized) 
    res.json(result) 
}) 

module.exports = router
