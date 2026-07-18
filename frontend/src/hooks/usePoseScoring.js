// src/hooks/usePoseScoring.js
import { useRef, useState } from 'react'

// Debounce helper: pose-scoring doesn't need to run on every single
// frame (30-60fps) — we only send a request a couple times a second.
function useThrottledCallback(callback, delayMs) {
  const lastRun = useRef(0)
  return (...args) => {
    const now = Date.now()
    if (now - lastRun.current >= delayMs) {
      lastRun.current = now
      callback(...args)
    }
  }
}

export function usePoseScoring(activePoseName) {
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState('')

  const scoreFrame = useThrottledCallback(async (landmarks) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pose/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poseName: activePoseName, landmarks }),
      })
      const data = await res.json()
      setScore(data.accuracy)
      setFeedback(data.feedback)
    } catch {
      // Silently ignore a single dropped scoring request — don't
      // interrupt the live session over one flaky network blip.
    }
  }, 500) // score at most twice per second

  return { score, feedback, scoreFrame }
}

export function AccuracyBadge({ score, feedback }) {
  if (score === null) return null

  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="absolute top-4 right-4 space-y-1 text-right">
      <div className={`inline-block px-3 py-1 rounded-full text-white font-semibold ${color}`}>
        {Math.round(score)}%
      </div>
      {feedback && (
        <p className="bg-black/60 text-white text-sm px-2 py-1 rounded max-w-xs">
          {feedback}
        </p>
      )}
    </div>
  )
}