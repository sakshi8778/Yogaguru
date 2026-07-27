// intentional, not like an unexplained black box.
function PlanIntensityBadge({ adaptationNotes }) {
  if (!adaptationNotes || adaptationNotes.length === 0) return null
  return (
    <div className="max-w-2xl mx-auto mb-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 font-bold text-left">
        Personalized for you
      </p>
      <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 text-left">
        {adaptationNotes.map((note, i) => (
          <li key={i}>• {note}</li>
        ))}
      </ul>
    </div>
  )
}
export default PlanIntensityBadge