const express = require('express') 
const router = express.Router() 
const db = require('../db') 
const { generateDailyPlan } = require('../gemini') 
const { rateLimit } = require('../utils/rateLimiter')

const profileLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 15,                  // limit each IP to 15 requests per windowMs
    message: 'Too many profile requests. Please try again in 5 minutes.'
})

// GET /api/profile/:userId
router.get('/:userId', async (req, res) => {
    try {
        const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatar_url,
            ageGroup: user.age_group,
            healthConditions: JSON.parse(user.health_conditions || '[]'),
            goals: JSON.parse(user.goals || '[]')
        });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/profile 
// Saves the user's onboarding answers, then immediately asks Gemini 
// for today's plan so the frontend gets both back in one round trip.
router.post('/', profileLimiter, async (req, res) => { 
    const { userId, name, ageGroup, healthConditions, goals } = req.body 
    
    if (!name || !ageGroup) { 
        return res.status(400).json({ error: 'name and ageGroup are required' }) 
    } 
    try { 
        let finalUserId = userId;

        if (userId) {
            // Update existing user profile
            await db.prepare(`
                UPDATE users
                SET name = ?, age_group = ?, health_conditions = ?, goals = ?
                WHERE id = ?
            `).run(
                name,
                ageGroup,
                JSON.stringify(healthConditions || []),
                JSON.stringify(goals || []),
                userId
            );
        } else {
            // Insert new user
            const result = await db.prepare(` 
                INSERT INTO users (name, age_group, health_conditions, goals) 
                VALUES (?, ?, ?, ?)
            `).run(
                name,
                ageGroup,
                JSON.stringify(healthConditions || []),
                JSON.stringify(goals || []) 
            );
            finalUserId = result.lastInsertRowid;
        }

        // Generate plan
        const plan = await generateDailyPlan({ ageGroup, healthConditions, goals }) 

        // Save daily plan
        await db.prepare(` 
            INSERT INTO plans (user_id, plan_json) 
            VALUES (?, ?) 
        `).run(finalUserId, JSON.stringify(plan));

        res.json({ 
            userId: finalUserId, 
            name, 
            ageGroup, 
            healthConditions,
            goals,
            plan, 
        }) 
    } catch (err) { 
        console.error(err) 
        res.status(500).json({ error: 'Failed to create profile or generate plan' }) 
    } 
})

module.exports = router

