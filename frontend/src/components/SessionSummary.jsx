import { useState, useEffect } from 'react'
function SessionSummary({ userId, poseScores }) {
// poseScores: array of { poseName, accuracy } collected as the user
// moved through DailyPlan.jsx — passed down from the parent that
// tracks progress across the whole session.
const [streak, setStreak] = useState(null)
const [saving, setSaving] = useState(true)
useEffect(() => {
async function saveSession() {
try {
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/session`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ userId, poseScores }),
})
const data = await res.json()
setStreak(data.currentStreak)
} catch {
setStreak(null) // dashboard just won't show a streak if this fails
} finally {
setSaving(false)
}
}
saveSession()
// Deliberately runs once per mount (empty deps) — this screen only
// ever appears once per completed session, so there's no scenario
// where we'd want to re-save on a re-render.
}, [])
const averageAccuracy =
poseScores.length > 0
? Math.round(
poseScores.reduce((sum, p) => sum + (p.accuracy || 0), 0) / poseScores.length
)
: null

return (
	<div className="max-w-md mx-auto p-6 text-center space-y-4">
		<h2 className="text-2xl font-bold">Session Complete!</h2>

		{averageAccuracy !== null && (
			<p className="text-slate-300">Average form accuracy: {averageAccuracy}%</p>
		)}

		{saving ? (
			<p className="text-slate-500 text-sm">Saving your progress...</p>
		) : streak !== null ? (
			<p className="text-emerald-400 font-semibold">{streak}-day streak!</p>
		) : (
			<p className="text-slate-500 text-sm">Couldn't save streak — check your connection</p>
		)}
	</div>
)
}

export default SessionSummary