import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar({ activeTab, setActiveTab, onProfileUpdate }) {
  const { user, logout, updateLocalProfile } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit fields state
  const [editName, setEditName] = useState(user?.name || '');
  const [editAgeGroup, setEditAgeGroup] = useState(user?.ageGroup || 'adult');
  const [editHealth, setEditHealth] = useState(user?.healthConditions || []);
  const [editGoals, setEditGoals] = useState(user?.goals || []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const getInitials = (name) => {
    if (!name) return 'YG';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const toggleHealth = (option) => {
    if (option === 'none') {
      setEditHealth(['none']);
    } else {
      let next = editHealth.filter(x => x !== 'none');
      if (next.includes(option)) {
        next = next.filter(x => x !== option);
      } else {
        next.push(option);
      }
      if (next.length === 0) {
        next = ['none'];
      }
      setEditHealth(next);
    }
  };

  const toggleGoal = (option) => {
    if (editGoals.includes(option)) {
      setEditGoals(editGoals.filter(x => x !== option));
    } else {
      setEditGoals([...editGoals, option]);
    }
  };

  const handleOpenEdit = () => {
    setEditName(user?.name || '');
    setEditAgeGroup(user?.ageGroup || 'adult');
    setEditHealth(user?.healthConditions || []);
    setEditGoals(user?.goals || []);
    setSaveError(null);
    setEditModalOpen(true);
    setDropdownOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveError('Name is required');
      return;
    }
    if (editGoals.length === 0) {
      setSaveError('Please select at least one yoga focus');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const updatedData = {
      userId: user.id,
      name: editName.trim(),
      ageGroup: editAgeGroup,
      healthConditions: editHealth.length > 0 ? editHealth : ['none'],
      goals: editGoals
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await res.json();
      
      const updatedUser = {
        ...user,
        name: data.name,
        ageGroup: data.ageGroup,
        healthConditions: data.healthConditions,
        goals: data.goals
      };

      updateLocalProfile(updatedUser);
      setEditModalOpen(false);
      
      if (onProfileUpdate) {
        onProfileUpdate(data.plan); // reload daily plan
      }
    } catch (err) {
      setSaveError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧘‍♀️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              YogaGuru
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('daily-plan')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'daily-plan'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setActiveTab('pose-library')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'pose-library'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pose Library
            </button>
          </nav>

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none cursor-pointer rounded-full p-0.5 border-2 border-transparent hover:border-emerald-500 transition-all duration-300"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {getInitials(user?.name)}
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-40 py-4 px-5 text-left space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-white truncate">{user?.name}</h4>
                      <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Personalization Summary */}
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Age Group</span>
                      <span className="px-2 py-0.5 bg-slate-750 text-slate-200 rounded-md border border-slate-700 capitalize">
                        {user?.ageGroup}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Pain Points</span>
                      <div className="flex flex-wrap gap-1">
                        {user?.healthConditions && user.healthConditions.length > 0 ? (
                          user.healthConditions.map((h) => (
                            <span key={h} className="px-2 py-0.5 bg-red-950/20 text-red-300 border border-red-900/30 rounded-md capitalize">
                              {h.replace('_', ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Yoga Focus</span>
                      <div className="flex flex-wrap gap-1">
                        {user?.goals && user.goals.length > 0 ? (
                          user.goals.map((g) => (
                            <span key={g} className="px-2 py-0.5 bg-emerald-950/20 text-emerald-300 border border-emerald-900/30 rounded-md capitalize">
                              {g.replace('_', ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700 flex flex-col gap-2">
                    <button
                      onClick={handleOpenEdit}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Edit Personalization
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full py-2 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/20 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Edit Personalization</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold cursor-pointer focus:outline-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-400">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Age Group */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Age Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {['kid', 'teen', 'adult', 'old'].map((age) => (
                    <button
                      type="button"
                      key={age}
                      onClick={() => setEditAgeGroup(age)}
                      className={`py-2 rounded-lg text-xs font-medium border capitalize cursor-pointer transition-all ${
                        editAgeGroup === age
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                          : 'bg-slate-800 border-slate-750 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain Concerns */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Health Concerns / Pain Points</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'back_pain', label: 'Back Pain' },
                    { key: 'knee_pain', label: 'Knee Pain' },
                    { key: 'neck_pain', label: 'Neck Pain' },
                    { key: 'none', label: 'None' }
                  ].map((opt) => {
                    const selected = editHealth.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleHealth(opt.key)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                          selected
                            ? 'bg-red-950/20 text-red-400 border-red-500/40'
                            : 'bg-slate-800 border-slate-750 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Yoga Focus (Objectives)</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'flexibility', label: 'Flexibility' },
                    { key: 'strength', label: 'Strength' },
                    { key: 'stress_relief', label: 'Stress Relief' },
                    { key: 'weight_loss', label: 'Weight Loss' }
                  ].map((opt) => {
                    const selected = editGoals.includes(opt.key);
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleGoal(opt.key)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium border text-left cursor-pointer transition-all ${
                          selected
                            ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/45'
                            : 'bg-slate-800 border-slate-750 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {saveError && (
                <p className="text-red-400 text-xs text-center font-medium bg-red-950/15 py-2 rounded-lg border border-red-500/20">
                  {saveError}
                </p>
              )}

              <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-xs font-medium text-slate-350 hover:bg-slate-800 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || editGoals.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-emerald-950/20 transition-all flex items-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
