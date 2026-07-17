// Displays the plan returned from Day 2's onboarding call (or fetched
// fresh via GET /api/plan/:userId once a user returns on a later day).
import { useState } from 'react'
// Maps a pose name to a YouTube video ID. In a real build this would
// come from the backend/plan JSON itself — hardcoded here for Day 3
// since Person B hasn't wired video keys into the Gemini prompt yet.
const VIDEO_MAP = {
'Cat-Cow Stretch': 'kM2Rp6y1sZ4',
'Child\u2019s Pose': 'eqVMAPM00DM',
}
function DailyPlan({ plan }) {
// activeIndex tracks which pose is currently playing/expanded.
// Using an index (not the whole pose object) keeps comparisons cheap
// and avoids re-render bugs from comparing objects by reference.
const [activeIndex, setActiveIndex] = useState(0)
const activePose = plan.poses[activeIndex]
const videoId = VIDEO_MAP[activePose.name]
return (
<div className="max-w-2xl mx-auto p-6 space-y-6">
<div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
{videoId ? (
<iframe
className="w-full h-full"
src={`https://www.youtube.com/embed/${videoId}?rel=0`}
title={activePose.name}
allow="accelerometer; autoplay; encrypted-media"
allowFullScreen
/>
) : (
<div className="flex items-center justify-center h-full text-slate-400">
No video mapped for this pose yet
</div>
)}
</div>
<div>
<h2 className="text-xl font-semibold">{activePose.name}</h2>
<p className="text-slate-300 text-sm mt-1">{activePose.instructions}</p>
<p className="text-slate-500 text-xs mt-1">
{activePose.durationSeconds}s
</p>
</div>
<ol className="space-y-2">
{plan.poses.map((pose, i) => (
<li key={pose.name}>
<button
onClick={() => setActiveIndex(i)}

className={`w-full text-left px-3 py-2 rounded ${
i === activeIndex
? 'bg-emerald-600 text-white'
: i < activeIndex
? 'bg-slate-800 text-slate-500 line-through'
: 'bg-slate-800 text-slate-300'
}`}
>
{i + 1}. {pose.name}
</button>
</li>
))}
</ol>
</div>
)
}
export default DailyPlan
