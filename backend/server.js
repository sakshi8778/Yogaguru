require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')
const app = express()
const PORT = process.env.PORT || 5000
const planRoutes = require('./routes/plan')
const profileRoutes = require('./routes/profile')
const poseRoutes = require('./routes/pose')
const sessionRoutes = require('./routes/session')
const authRoutes = require('./routes/auth')

// Run database migrations on boot
const { runMigration } = require('./migrations/002_auth_fields')
runMigration().catch(err => {
  console.error('Failed to run database migrations on startup:', err)
})

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://yogaguru-lovat.vercel.app',
  process.env.FRONTEND_URL
]
  .filter(Boolean)
  .map(origin => origin.trim().replace(/\/$/, ''))

const corsOptions = {
  origin: (origin, callback) => {
    // origin is undefined for same-origin/non-browser requests (e.g. Postman)
    if (!origin) {
      return callback(null, true)
    }
    const normalizedOrigin = origin.trim().replace(/\/$/, '')
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Handle preflight OPTIONS requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})


app.use(express.json())

//

app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/plan', planRoutes)
app.use('/api/pose', poseRoutes)
app.use('/api/session', sessionRoutes)
// Simple health-check route. Person A's frontend polls this on load
// to confirm the backend is reachable — cheap way to catch
// "wrong port" or "server not started" bugs early.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})
app.listen(PORT, () => {
  console.log(`YogaGuru backend running on http://localhost:${PORT}`)
})