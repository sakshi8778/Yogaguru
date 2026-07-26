const express = require('express')
const router = express.Router()
const db = require('../db')
const { calculateStreak } = require('../utils/streak')
// POST /api/session
// Saves a completed session and returns the user's updated streak.
router.post('/', async (req, res) => {
const { userId, poseScores } = req.body
if (!userId || !Array.isArray(poseScores)) {
return res.status(400).json({ error: 'userId and poseScores array are required' })
}
const averageAccuracy =
poseScores.length > 0
? poseScores.reduce((sum, p) => sum + (p.accuracy || 0), 0) / poseScores.length
: null
try {
await db.prepare(`
INSERT INTO sessions (user_id, average_accuracy, pose_scores_json)
VALUES (?, ?, ?)
`).run(userId, averageAccuracy, JSON.stringify(poseScores))
const pastSessions = await db
.prepare('SELECT completed_at FROM sessions WHERE user_id = ?')
.all(userId)
const currentStreak = calculateStreak(pastSessions.map((s) => s.completed_at))
res.json({ currentStreak, averageAccuracy })
} catch (err) {
console.error(err)
res.status(500).json({ error: 'Internal server error' })
}
})
// GET /api/session/history/:userId
// Used by a future dashboard chart — returns all past sessions.
router.get('/history/:userId', async (req, res) => {
try {
const rows = await db
.prepare('SELECT average_accuracy, completed_at FROM sessions WHERE user_id = ? ORDER BY completed_at ASC')
.all(req.params.userId)
res.json({ sessions: rows })
} catch (err) {
console.error(err)
res.status(500).json({ error: 'Internal server error' })
}
})
module.exports = router