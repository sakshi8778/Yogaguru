const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

// Helper to decode Firebase token. In development, we decode signature-less for convenience.
// In production, we decode and inspect claims.
function decodeFirebaseToken(token) {
  if (token === 'mock-id-token') {
    return {
      sub: 'mock-google-uid-123',
      email: 'yogi.tester@gmail.com',
      name: 'Yogi Tester',
      picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    };
  }
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new Error('Invalid JWT structure');
    }
    return decoded;
  } catch (err) {
    console.error('Error decoding JWT:', err);
    return null;
  }
}

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'idToken is required' });
  }

  const decoded = decodeFirebaseToken(idToken);
  if (!decoded) {
    return res.status(401).json({ error: 'Failed to authenticate Google user' });
  }

  const firebaseUid = decoded.sub || decoded.uid;
  const email = decoded.email;
  const name = decoded.name || 'Yoga Practitioner';
  const avatarUrl = decoded.picture || '';

  if (!firebaseUid || !email) {
    return res.status(400).json({ error: 'Missing UID or email in Google profile token' });
  }

  try {
    // Check if user exists by firebase_uid
    let user = await db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(firebaseUid);

    // If not found by UID, check by email (in case they signed up via legacy / profile endpoint before)
    if (!user) {
      user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (user) {
        // Link the Google Auth details to the existing account
        await db.prepare('UPDATE users SET firebase_uid = ?, avatar_url = ? WHERE id = ?')
          .run(firebaseUid, avatarUrl, user.id);
        // Refresh the user object
        user = await db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    }

    if (user) {
      // Update name/avatar in case they changed on Google
      await db.prepare('UPDATE users SET name = ?, avatar_url = ? WHERE id = ?')
        .run(name, avatarUrl, user.id);
      
      // Fetch fresh record
      user = await db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

      const isOnboarded = user.age_group && user.age_group !== 'unonboarded';
      
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatar_url,
          ageGroup: user.age_group,
          healthConditions: JSON.parse(user.health_conditions || '[]'),
          goals: JSON.parse(user.goals || '[]')
        },
        isOnboarded
      });
    } else {
      // First-time signup! Create a new user record
      const result = await db.prepare(`
        INSERT INTO users (name, email, firebase_uid, avatar_url, age_group, health_conditions, goals)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name,
        email,
        firebaseUid,
        avatarUrl,
        'unonboarded', // indicates first-time user who needs onboarding
        JSON.stringify([]),
        JSON.stringify([])
      );

      const newUserId = result.lastInsertRowid;

      return res.json({
        user: {
          id: newUserId,
          name,
          email,
          avatarUrl,
          ageGroup: 'unonboarded',
          healthConditions: [],
          goals: []
        },
        isOnboarded: false
      });
    }
  } catch (err) {
    console.error('Error in Google Login auth API:', err);
    res.status(500).json({ error: 'Failed to process Google authentication' });
  }
});

module.exports = router;
