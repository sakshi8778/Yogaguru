// src/App.jsx
import { useState } from 'react'
import OnboardingForm from './components/OnboardingForm'
import DailyPlan from './components/DailyPlan'
import PlanIntensityBadge from './components/PlanIntensityBadge'

function App() {
  // Once onboarding succeeds, this holds { userId, name, ageGroup, plan }
  const [profile, setProfile] = useState(null)

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!profile ? (
        <OnboardingForm onComplete={(data) => setProfile(data)} />
      ) : (
        <>
          <PlanIntensityBadge adaptationNotes={profile.plan.adaptationNotes} />
          <DailyPlan plan={profile.plan} />
        </>
      )}
    </div>
  )
}

export default App