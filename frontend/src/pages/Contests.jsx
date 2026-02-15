import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Trophy, Calendar, Clock, Users } from 'lucide-react';

const statusStyle = {
  UPCOMING: 'text-blue-600 bg-blue-50',
  RUNNING: 'text-emerald-600 bg-emerald-50',
  ENDED: 'text-gray-500 bg-gray-100',
};

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contests')
      .then((res) => setContests(res.data))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contests</h1>
        <p className="text-gray-500 text-sm mt-1">Compete and test your skills</p>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No contests available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contests.map((c) => (
            <Link
              key={c.id}
              to={`/contests/${c.id}`}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusStyle[c.status]}`}>
                  {c.status}
                </span>
              </div>
              {c.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(c.start_time)}
                </span>
                {c.problemCount !== undefined && (
                  <span>{c.problemCount} problems</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
