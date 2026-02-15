import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { User, Trophy, Code2, CheckCircle2, Calendar } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${username}`)
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.username}</h1>
            <div className="flex items-center gap-4 mt-1">
              {profile.rating !== undefined && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Rating: <strong className="text-gray-700">{profile.rating}</strong>
                </span>
              )}
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Problems Solved', value: profile.solvedCount ?? profile.solvedProblems?.length ?? 0, icon: CheckCircle2, color: 'emerald' },
          { label: 'Total Submissions', value: profile.submissionCount ?? 0, icon: Code2, color: 'indigo' },
          { label: 'Rating', value: profile.rating ?? 0, icon: Trophy, color: 'amber' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <s.icon className={`w-5 h-5 text-${s.color}-500 mx-auto mb-2`} />
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Solved problems */}
      {profile.solvedProblems?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Solved Problems</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {profile.solvedProblems.map((p) => (
              <Link
                key={p.id}
                to={`/problems/${p.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">{p.title}</span>
                <span className={`text-xs font-semibold ${
                  { EASY: 'text-emerald-600', MEDIUM: 'text-amber-600', HARD: 'text-red-600' }[p.difficulty]
                }`}>
                  {p.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
