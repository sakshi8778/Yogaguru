import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function OnboardingWizard({ onComplete }) {
  const { user, updateLocalProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [ageGroup, setAgeGroup] = useState('adult'); // default to adult
  const [healthConditions, setHealthConditions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleHealth = (option) => {
    if (option === 'none') {
      setHealthConditions(['none']);
    } else {
      let next = healthConditions.filter(x => x !== 'none');
      if (next.includes(option)) {
        next = next.filter(x => x !== option);
      } else {
        next.push(option);
      }
      if (next.length === 0) {
        next = ['none'];
      }
      setHealthConditions(next);
    }
  };

  const toggleGoal = (option) => {
    if (goals.includes(option)) {
      setGoals(goals.filter(x => x !== option));
    } else {
      setGoals([...goals, option]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError(null);

    // Prepare body
    const onboardingData = {
      userId: user.id,
      name: name.trim(),
      ageGroup,
      healthConditions: healthConditions.length > 0 ? healthConditions : ['none'],
      goals: goals
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!res.ok) {
        throw new Error('Failed to save onboarding profile and generate plan.');
      }

      const data = await res.json();
      
      // Update our context user info
      const updatedUser = {
        ...user,
        name: data.name,
        ageGroup: data.ageGroup,
        healthConditions: data.healthConditions,
        goals: data.goals
      };
      
      updateLocalProfile(updatedUser);
      
      if (onComplete) {
        onComplete(data); // contains the generated plan
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Name Input
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400">Welcome to YogaGuru!</h2>
        <p className="text-slate-400 text-sm mt-2">Let's start by getting to know you. What should we call you?</p>
      </div>
      <div className="space-y-2">
        <label className="block text-slate-300 text-sm font-medium">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
        />
      </div>
    </div>
  );

  // Step 2: Age Group Cards
  const ageOptions = [
    { key: 'kid', label: 'Kid', icon: '🧒', desc: 'Up to 12 years' },
    { key: 'teen', label: 'Teen', icon: '🧑', desc: '13 to 19 years' },
    { key: 'adult', label: 'Adult', icon: '🧑‍🦰', desc: '20 to 60 years' },
    { key: 'old', label: 'Old', icon: '🧓', desc: '60+ years' }
  ];

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400">What is your age group?</h2>
        <p className="text-slate-400 text-sm mt-2">This helps us scale physical intensity and hold times appropriately.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {ageOptions.map((opt) => {
          const selected = ageGroup === opt.key;
          return (
            <button
              type="button"
              key={opt.key}
              onClick={() => setAgeGroup(opt.key)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all duration-300 cursor-pointer hover:translate-y-[-2px] ${
                selected
                  ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <h4 className="font-semibold text-white">{opt.label}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 3: Health Concerns Multi-Select Cards
  const healthOptions = [
    { key: 'back_pain', label: 'Back Pain', icon: '🏥', desc: 'Lower or upper back stiffness' },
    { key: 'knee_pain', label: 'Knee Pain', icon: '🦵', desc: 'Joint soreness or limitations' },
    { key: 'neck_pain', label: 'Neck Pain', icon: '🧘', desc: 'Shoulder or cervical strain' },
    { key: 'none', label: 'None', icon: '✅', desc: 'No physical limitations' }
  ];

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400">Any health concerns or pain?</h2>
        <p className="text-slate-400 text-sm mt-2">Select all that apply. We will filter out poses that could exacerbate these areas.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {healthOptions.map((opt) => {
          const selected = healthConditions.includes(opt.key);
          return (
            <button
              type="button"
              key={opt.key}
              onClick={() => toggleHealth(opt.key)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all duration-300 cursor-pointer hover:translate-y-[-2px] ${
                selected
                  ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <h4 className="font-semibold text-white">{opt.label}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 4: Primary Yoga Focus Multi-Select Cards
  const goalOptions = [
    { key: 'flexibility', label: 'Flexibility', icon: '🤸', desc: 'Lengthen muscles & increase range' },
    { key: 'strength', label: 'Strength', icon: '💪', desc: 'Build core & bodyweight stability' },
    { key: 'stress_relief', label: 'Stress Relief', icon: '🍃', desc: 'Unwind & calm the nervous system' },
    { key: 'weight_loss', label: 'Weight Loss', icon: '🏃', desc: 'Active flows to raise heart rate' }
  ];

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-emerald-400">What is your primary yoga focus?</h2>
        <p className="text-slate-400 text-sm mt-2">Choose your objectives. We will prioritize poses that align with your targets.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {goalOptions.map((opt) => {
          const selected = goals.includes(opt.key);
          return (
            <button
              type="button"
              key={opt.key}
              onClick={() => toggleGoal(opt.key)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between h-32 transition-all duration-300 cursor-pointer hover:translate-y-[-2px] ${
                selected
                  ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
              }`}
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <h4 className="font-semibold text-white">{opt.label}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Calculate Progress Percentage
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="min-h-[280px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {error && (
          <p className="text-red-400 text-sm mt-4 text-center bg-red-950/20 py-2 px-4 rounded-lg border border-red-500/20">
            {error}
          </p>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-medium transition-all"
          >
            Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer font-medium shadow-md shadow-emerald-950/30 hover:shadow-emerald-950/50 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || goals.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer font-medium shadow-md shadow-emerald-950/30 hover:shadow-emerald-950/50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Plan...
                </>
              ) : (
                'Start My Journey'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default OnboardingWizard;
