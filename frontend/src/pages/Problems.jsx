import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Filter, ChevronRight } from 'lucide-react';

const difficultyColor = {
  EASY: 'text-emerald-600 bg-emerald-50',
  MEDIUM: 'text-amber-600 bg-amber-50',
  HARD: 'text-red-600 bg-red-50',
};

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topicId, setTopicId] = useState('');

  useEffect(() => {
    api.get('/topics').then((res) => setTopics(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (difficulty) params.difficulty = difficulty;
    if (topicId) params.topic_id = topicId;
    api.get('/problems', { params })
      .then((res) => setProblems(res.data))
      .finally(() => setLoading(false));
  }, [search, difficulty, topicId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Problems</h1>
        <p className="text-gray-500 text-sm mt-1">Practice and improve your skills</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Topic</th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">Loading...</td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-gray-400 text-sm">No problems found</td>
              </tr>
            ) : (
              problems.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-6 py-4">
                    <Link to={`/problems/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {p.Topic && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">{p.Topic.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${difficultyColor[p.difficulty]}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/problems/${p.id}`} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
