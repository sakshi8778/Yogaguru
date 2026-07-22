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
const allowedOrigins = [
'http://localhost:5173',
process.env.FRONTEND_URL, // e.g. https://yogaguru.vercel.app
]
app.use(
cors({
origin: (origin, callback) => {
// origin is undefined for same-origin/non-browser requests
// (e.g. Postman) — allow those through for testing.
if (!origin || allowedOrigins.includes(origin)) {
callback(null, true)
} else {
callback(new Error('Not allowed by CORS'))
}
},
})
)

app.use(express.json())

//

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