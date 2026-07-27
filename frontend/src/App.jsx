import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import OnboardingWizard from './components/OnboardingWizard'
import DailyPlan from './components/DailyPlan'
import PlanIntensityBadge from './components/PlanIntensityBadge'
import Navbar from './components/Navbar'
import PoseLibrary from './components/PoseLibrary'

function App() {
  const { user, loading, error, loginWithGoogle, isMockAuth } = useAuth()
  const [activeTab, setActiveTab] = useState('daily-plan')
  const [plan, setPlan] = useState(null)
  const [fetchingPlan, setFetchingPlan] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Fetch plan when onboarded user logs in
  useEffect(() => {
    if (user && user.ageGroup !== 'unonboarded') {
      setFetchingPlan(true)
      fetch(`${import.meta.env.VITE_API_URL}/api/plan/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('No plan found')
          return res.json()
        })
        .then((data) => {
          setPlan(data.plan)
        })
        .catch((err) => {
          console.error('Error fetching plan:', err)
          setPlan(null)
        })
        .finally(() => {
          setFetchingPlan(false)
        })
    } else {
      setPlan(null)
    }
  }, [user])

  const handleLogin = async () => {
    setAuthError(null)
    try {
      await loginWithGoogle()
    } catch (err) {
      setAuthError(err.message || 'Failed to authenticate')
    }
  }

  const handleOnboardingComplete = (data) => {
    setPlan(data.plan)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center gap-4 transition-colors duration-200">
        <svg className="animate-spin h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Aligning your energy...</p>
      </div>
    )
  }

  // 1. Not logged in: Show premium login page
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
        {/* Decorative blur backgrounds */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/5 -top-40 -left-40 blur-[120px] pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-teal-500/5 -bottom-40 -right-40 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850/80 backdrop-blur-md rounded-3xl p-8 text-center space-y-8 shadow-2xl relative z-10 transition-colors duration-200">
          <div className="space-y-3">
            <span className="text-5xl block animate-bounce duration-[2000ms]">🧘‍♀️</span>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              YogaGuru
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Your AI-powered personalized yoga companion</p>
          </div>

          {/* Benefits */}
          <ul className="text-left bg-slate-100 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-850/60 space-y-3.5 text-xs text-slate-700 dark:text-slate-350 transition-colors duration-200">
            <li className="flex items-center gap-2.5">
              <span className="text-emerald-500 dark:text-emerald-400 text-sm">🎯</span>
              <span>Pose recommendations personalized for your targets.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-emerald-500 dark:text-emerald-400 text-sm">🏥</span>
              <span>Automatic safety filters to protect joints and pain points.</span>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-emerald-500 dark:text-emerald-400 text-sm">⏱️</span>
              <span>Intelligent hold time scaling adjusted to your age.</span>
            </li>
          </ul>

          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-slate-950 font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-3 active:scale-[0.98] border border-slate-200 dark:border-transparent"
            >
              {/* Google G logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.591-5.592c1.472 0 2.8.567 3.8 1.492l3.223-3.223C19.06 3.738 16.712 2.8 13.99 2.8 8.91 2.8 4.8 6.91 4.8 11.99s4.11 9.19 9.19 9.19c5.3 0 9.19-3.725 9.19-9.19 0-.624-.057-1.226-.16-1.705H12.24Z"
                />
              </svg>
              Sign in with Google
            </button>

            {isMockAuth && (
              <p className="text-[10px] text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-850 transition-colors duration-200">
                🔧 <strong>Development Mode:</strong> Live Firebase API Key not detected. Google Login will automatically sign you in with a mock profile.
              </p>
            )}

            {authError && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-medium bg-red-50 dark:bg-red-950/20 py-2 rounded-lg border border-red-200 dark:border-red-500/20">
                {authError}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 2. Logged in but not onboarded: Show onboarding wizard
  if (user.ageGroup === 'unonboarded') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-center p-4 transition-colors duration-200">
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    )
  }

  // 3. Logged in and Onboarded: Show app dashboard
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-200">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileUpdate={(updatedPlan) => setPlan(updatedPlan)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto py-6">
        {activeTab === 'daily-plan' && (
          <div className="p-4 space-y-6 animate-fade-in">
            {fetchingPlan ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Aligning today's recommendations...</p>
              </div>
            ) : plan ? (
              <>
                <PlanIntensityBadge adaptationNotes={plan.adaptationNotes} />
                <DailyPlan plan={plan} />
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900/40 border border-slate-205 dark:border-slate-850 rounded-2xl transition-colors duration-200">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Failed to generate daily plan. Try updating your profile parameters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pose-library' && <PoseLibrary />}
      </main>
    </div>
  )
}

export default App
