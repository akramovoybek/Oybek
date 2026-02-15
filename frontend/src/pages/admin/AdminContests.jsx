import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/contests')
      .then((res) => setContests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this contest?')) return;
    try {
      await api.delete(`/admin/contests/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Contests</h2>
        <Link
          to="/admin/contests/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Contest
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Start</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">End</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : contests.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No contests</td></tr>
            ) : (
              contests.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm text-gray-400 font-mono">{c.id}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.title}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(c.start_time)}</td>
                  <td className="px-6 py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(c.end_time)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/contests/${c.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all">
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
