import { useState } from 'react'
const AGE_GROUPS = ['kid', 'teen', 'adult', 'elderly']
const HEALTH_OPTIONS = ['back_pain', 'knee_issue', 'high_bp', 'none']
const GOAL_OPTIONS = ['flexibility', 'strength', 'stress_relief', 'weight_loss']
function OnboardingForm({ onComplete }) {
const [name, setName] = useState('')
const [ageGroup, setAgeGroup] = useState('adult')
// Health conditions & goals are arrays because a user can pick more
// than one — a plain useState('') wouldn't let us track multiple checks.
const [healthConditions, setHealthConditions] = useState([])
const [goals, setGoals] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
// Generic toggle helper: if the value is already in the array, remove it;
// otherwise add it. Reused for both health conditions and goals so we
// don't duplicate this logic twice.
const toggle = (value, list, setList) => {
  setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
}

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        ageGroup,
        healthConditions,
        goals,
      }),
    })

    if (!res.ok) {
      throw new Error('Unable to generate your plan right now.')
    }

    const data = await res.json()
    if (onComplete) {
      onComplete(data)
    }
  } catch (err) {
    setError(err.message || 'Something went wrong.')
  } finally {
    setLoading(false)
  }
}

return (
<form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6">
<input
className="w-full p-2 rounded bg-slate-800 text-white"
placeholder="Your name"


value={name}
onChange={(e) => setName(e.target.value)}
required
/>
<div>
<label className="block mb-1 text-sm text-slate-300">Age group</label>
<select
className="w-full p-2 rounded bg-slate-800 text-white"
value={ageGroup}
onChange={(e) => setAgeGroup(e.target.value)}
>
{AGE_GROUPS.map((g) => (
<option key={g} value={g}>{g}</option>
          ))}
</select>
</div>
<div>
<label className="block mb-1 text-sm text-slate-300">Health conditions</label>
<div className="flex flex-wrap gap-2">
{HEALTH_OPTIONS.map((opt) => (
<button
type="button" // type="button" is critical here — without it,
// these act as submit buttons and fire the form early on every click.
key={opt}
onClick={() => toggle(opt, healthConditions, setHealthConditions)}
className={`px-3 py-1 rounded-full text-sm ${
                healthConditions.includes(opt)
? 'bg-emerald-500 text-white'
: 'bg-slate-700 text-slate-300'
}`}
>
{opt}
</button>
          ))}
</div>
</div>
<div>
<label className="block mb-1 text-sm text-slate-300">Goals</label>
<div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((opt) => (
                <button
                    type="button"
                    key={opt}
                    onClick={() => toggle(opt, goals, setGoals)}
                    className={`px-3 py-1 rounded-full text-sm ${
                        goals.includes(opt) ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                >
                    {opt}
                </button>
            ))}
</div>
</div>
{error && <p className="text-red-400 text-sm">{error}</p>}
<button
type="submit"
disabled={loading}
className="w-full py-2 rounded bg-emerald-600 text-white disabled:opacity-50"
>
{loading ? 'Generating your plan...' : 'Start My Journey'}
</button>
    </form>
)
}
export default OnboardingForm