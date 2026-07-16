require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')
const app = express()
const PORT = process.env.PORT || 5000
// cors() with no options allows any origin during local dev.
// We'll lock this down to our real frontend URL before deploying (Day 8).
app.use(cors())
// Lets Express parse incoming JSON bodies (req.body) automatically.
app.use(express.json())
// Simple health-check route. Person A's frontend polls this on load
// to confirm the backend is reachable — cheap way to catch
// "wrong port" or "server not started" bugs early.
app.get('/api/health', (req, res) => {
res.json({ status: 'ok' })
})
app.listen(PORT, () => {
console.log(`YogaGuru backend running on http://localhost:${PORT}`)
})