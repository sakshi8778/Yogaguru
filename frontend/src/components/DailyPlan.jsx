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
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-left transition-colors duration-200">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        {videoId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0`}
            title={activePose.name}
            allow="accelerometer; autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            No video mapped for this pose yet
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-200">{activePose.name}</h2>
        <p className="text-slate-650 dark:text-slate-300 text-sm transition-colors duration-200">{activePose.instructions}</p>
        <p className="text-slate-500 dark:text-slate-500 text-xs transition-colors duration-200 font-semibold">
          Duration: {activePose.durationSeconds}s
        </p>
      </div>
      <ol className="space-y-2">
        {plan.poses.map((pose, i) => (
          <li key={pose.name}>
            <button
              onClick={() => setActiveIndex(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer transition-all duration-200 ${
                i === activeIndex
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-950/20'
                  : i < activeIndex
                  ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 line-through border-slate-200/50 dark:border-slate-800/40'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750'
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

