import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const diffColor = {
  EASY: 'text-emerald-600 bg-emerald-50',
  MEDIUM: 'text-amber-600 bg-amber-50',
  HARD: 'text-red-600 bg-red-50',
};

export default function AdminProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/problems')
      .then((res) => setProblems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return;
    try {
      await api.delete(`/admin/problems/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Problems</h2>
        <Link
          to="/admin/problems/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Problem
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Difficulty</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Testcases</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : problems.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No problems</td></tr>
            ) : (
              problems.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm text-gray-400 font-mono">{p.id}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{p.Testcases?.length ?? p.testcaseCount ?? '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/problems/${p.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
