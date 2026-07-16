// src/App.jsx
// This is a temporary "is the backend alive?" screen.
// We will replace this with the onboarding flow on Day 2.
import { useState, useEffect } from 'react'

function App() {
  // healthStatus holds whatever the backend tells us.
  // We start it as "checking..." so the user sees immediate feedback
  // instead of a blank screen while the network request is in flight.
  const [healthStatus, setHealthStatus] = useState('checking...')

  // useEffect with an empty dependency array [] runs ONCE,
  // right after the component first renders — exactly what we want
  // for "check backend health on page load."
  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus('backend unreachable'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧘 YogaGuru AI</h1>
        <p className="text-slate-300">Backend status: {healthStatus}</p>
      </div>
    </div>
  )
}

export default App