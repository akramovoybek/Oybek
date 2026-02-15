import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Clock, ChevronLeft, Users, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const statusStyle = {
  UPCOMING: 'text-blue-600 bg-blue-50',
  RUNNING: 'text-emerald-600 bg-emerald-50',
  ENDED: 'text-gray-500 bg-gray-100',
};

export default function ContestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contest, setContest] = useState(null);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState('problems');

  useEffect(() => {
    Promise.all([
      api.get(`/contests/${id}`),
      api.get(`/contests/${id}/standings`).catch(() => ({ data: [] })),
    ])
      .then(([contestRes, standingsRes]) => {
        setContest(contestRes.data);
        setStandings(standingsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    setRegistering(true);
    try {
      await api.post(`/contests/${id}/register`);
      toast.success('Registered successfully!');
      const res = await api.get(`/contests/${id}`);
      setContest(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!contest) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Contest not found</div>;
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const isRegistered = contest.registrations?.some((r) => r.user_id === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/contests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Contests
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold text-gray-900">{contest.title}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusStyle[contest.status]}`}>
                  {contest.status}
                </span>
              </div>
              {contest.description && <p className="text-sm text-gray-500">{contest.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(contest.start_time)}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(contest.end_time)}</span>
              </div>
            </div>
            {contest.status !== 'ENDED' && !isRegistered && (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register'}
              </button>
            )}
            {isRegistered && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> Registered
              </span>
            )}
          </div>
        </div>

        <div className="px-6">
          <div className="flex gap-4 border-b border-gray-100">
            {['problems', 'standings'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`py-3 text-sm font-medium capitalize transition-colors ${
                  tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === 'problems' ? (
            <div className="space-y-2">
              {contest.problems?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No problems yet</p>
              ) : (
                contest.problems?.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/problems/${p.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400 w-6">{String.fromCharCode(65 + i)}</span>
                      <span className="text-sm font-medium text-gray-900">{p.title}</span>
                    </div>
                    <span className={`text-xs font-semibold ${
                      { EASY: 'text-emerald-600', MEDIUM: 'text-amber-600', HARD: 'text-red-600' }[p.difficulty]
                    }`}>
                      {p.difficulty}
                    </span>
                  </Link>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {standings.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No standings yet</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Solved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {standings.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3">
                          <Link to={`/users/${s.username}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                            {s.username}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{s.solvedCount || s.solved || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
