import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function PoseLibrary() {
  const { user } = useAuth();
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPersonalizedPoses = async () => {
      setLoading(true);
      setError(null);
      try {
        const userIdParam = user?.id ? `?userId=${user.id}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pose/personalized${userIdParam}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch personalized poses');
        }
        
        const data = await res.json();
        setPoses(data.poses || []);
      } catch (err) {
        console.error('Error fetching poses:', err);
        setError(err.message || 'Unable to retrieve poses right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedPoses();
  }, [user]);

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30';
      case 'intermediate':
        return 'bg-amber-950/20 text-amber-400 border border-amber-900/30';
      default:
        return 'bg-purple-950/20 text-purple-400 border border-purple-900/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-left transition-colors duration-200">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Personalized Pose Library</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
            Poses are sorted by your objectives and filtered to keep you safe and comfortable.
          </p>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5 min-w-[240px] transition-colors duration-200">
          <span className="text-slate-600 dark:text-slate-400 block font-semibold">Active Personalization Profiles:</span>
          <div className="flex flex-wrap gap-1.5">
            <span className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded capitalize font-medium transition-colors duration-200">
              {user?.ageGroup || 'Adult'} holds
            </span>
            {user?.healthConditions && user.healthConditions.map(cond => {
              if (cond === 'none') return null;
              return (
                <span key={cond} className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 px-2 py-0.5 rounded capitalize font-medium transition-colors duration-200">
                  Safe for {cond.replace('_', ' ')}
                </span>
              );
            })}
            {user?.goals && user.goals.map(goal => (
              <span key={goal} className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded capitalize font-medium transition-colors duration-200">
                {goal.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-slate-100 dark:bg-slate-850 rounded" />
                <div className="h-5 w-20 bg-slate-100 dark:bg-slate-850 rounded" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-850 rounded" />
                <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-850 rounded" />
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-850 rounded" />
                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-850 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-12 bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 rounded-2xl">
          <p className="text-red-650 dark:text-red-400 text-lg font-medium">{error}</p>
        </div>
      ) : poses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400 text-lg">No poses found matching your safety and health settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poses.map((pose) => (
            <div
              key={pose.name}
              className="bg-white hover:bg-slate-50/50 dark:bg-slate-900/40 dark:hover:bg-slate-900/70 border border-slate-200 dark:border-slate-850/80 dark:hover:border-slate-800 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:translate-y-[-2px] shadow-sm hover:shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pose.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(pose.difficulty)}`}>
                    {pose.difficulty}
                  </span>
                </div>

                {/* Focus Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {pose.focus.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold capitalize transition-colors duration-200">
                      {f.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                <p className="text-slate-600 dark:text-slate-350 text-xs leading-relaxed transition-colors duration-200">
                  {pose.instructions}
                </p>
              </div>

              {/* Personalized Specs */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-200">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Target Hold:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{pose.durationSeconds}s</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Reps:</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{pose.reps}x</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Breaths:</span>
                    <span className="text-teal-600 dark:text-teal-400 font-bold">{pose.breaths}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoseLibrary;

