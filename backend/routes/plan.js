const express = require('express') 
const router = express.Router() 
const db = require('../db') 
router.get('/:userId', async (req, res) => { 
    const { userId } = req.params 
    try {
        const row = await db 
        .prepare(` 
            SELECT plan_json FROM plans 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1 
            `) 
            .get(userId) 
        if (!row) { 
            return res.status(404).json({ error: 'No plan found for this user' }) 
        } 
        res.json({ plan: JSON.parse(row.plan_json) }) 
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
}) 
module.exports = router