// Displays the plan returned from Day 2's onboarding call (or fetched
// fresh via GET /api/plan/:userId once a user returns on a later day).
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

function DailyPlan({ plan }) {
  // activeIndex tracks which pose is currently playing/expanded.
  // Using an index (not the whole pose object) keeps comparisons cheap
  // and avoids re-render bugs from comparing objects by reference.
  const [activeIndex, setActiveIndex] = useState(0)
  const activePose = plan.poses[activeIndex]

  const [imageSrc, setImageSrc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!activePose) return

    let isMounted = true

    const fetchImage = async () => {
      setLoading(true)
      setError(null)
      setImageSrc(null)

      try {
        const url = `${API_BASE_URL}/api/pose/image/${encodeURIComponent(activePose.name)}`
        const res = await fetch(url)
        
        if (!res.ok) {
          const contentType = res.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errData = await res.json()
            throw new Error(errData.error || 'Failed to load reference image')
          } else {
            throw new Error('Could not retrieve reference image for this pose')
          }
        }

        const data = await res.json()
        if (isMounted) {
          setImageSrc(data.imageUrl)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Could not generate reference image for this pose')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchImage()

    return () => {
      isMounted = false
    }
  }, [activePose?.name])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-left transition-colors duration-200">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-slate-800 transition-colors duration-200 relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3 bg-slate-50 dark:bg-slate-900/40 p-6 text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Generating reference image with AI...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl space-y-2">
            <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-sm font-semibold text-rose-800 dark:text-rose-450">Unable to generate pose image</h3>
            <p className="text-xs text-rose-600 dark:text-rose-450 max-w-sm">{error}</p>
          </div>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt={activePose.name}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out transform hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            No image loaded
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-200">{activePose?.name}</h2>
        <p className="text-slate-650 dark:text-slate-300 text-sm transition-colors duration-200">{activePose?.instructions}</p>
        <p className="text-slate-500 dark:text-slate-500 text-xs transition-colors duration-200 font-semibold">
          Duration: {activePose?.durationSeconds}s
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
