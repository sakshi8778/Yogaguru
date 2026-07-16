const express = require('express') 
const router = express.Router() 
const db = require('../db') 
const { generateDailyPlan } = require('../gemini') 
// POST /api/profile 
// Saves the user's onboarding answers, then immediately asks Gemini 
// for today's plan so the frontend gets both back in one round trip — 
// avoids a second loading spinner on the very first screen. 
router.post('/', async (req, res) => { 
    const { name, ageGroup, healthConditions, goals } = req.body 
    
    if (!name || !ageGroup) { 
        return res.status(400).json({ error: 'name and ageGroup are required' }) 
    } 
    try { 
        const insert = db.prepare(` 
            INSERT INTO users (name, age_group, health_conditions, goals) 
            VALUES (?, ?, ?, ?) 
            `) 
            const result = insert.run( 
                name, 
                ageGroup, 
                JSON.stringify(healthConditions || []), 
                JSON.stringify(goals || []) 
            ) 
            
            const plan = await generateDailyPlan({ ageGroup, healthConditions, goals }) 
            
            res.json({ 
                
                userId: result.lastInsertRowid, 
                name, 
                ageGroup, 
                plan, 
            }) 
        } catch (err) { 
            console.error(err) 
            res.status(500).json({ error: 'Failed to create profile or generate plan' }) 
        } 
    })

module.exports = router