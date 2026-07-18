// intentional, not like an unexplained black box.
function PlanIntensityBadge({ adaptationNotes }) {
if (!adaptationNotes || adaptationNotes.length === 0) return null
return (
<div className="max-w-2xl mx-auto mb-4 p-3 rounded-lg bg-slate-800 border border
slate-700">
<p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
Personalized for you
</p>
<ul className="text-sm text-slate-300 space-y-1">
{adaptationNotes.map((note, i) => (
<li key={i}>• {note}</li>
))}
</ul>
</div>
)
}
export default PlanIntensityBadge