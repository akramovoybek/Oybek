import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [newForm, setNewForm] = useState({ name: '', description: '' });
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/topics')
      .then((res) => setTopics(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!newForm.name.trim()) return;
    try {
      await api.post('/admin/topics', newForm);
      toast.success('Topic created');
      setNewForm({ name: '', description: '' });
      setShowNew(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Create failed');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/topics/${id}`, editForm);
      toast.success('Updated');
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await api.delete(`/admin/topics/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Topics</h2>
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> New Topic
        </button>
      </div>

      {showNew && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} className={inputClass} placeholder="Topic name" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <input value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} className={inputClass} placeholder="Optional description" />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Create</button>
          <button onClick={() => setShowNew(false)} className="px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Description</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Problems</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</td></tr>
            ) : topics.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">No topics</td></tr>
            ) : (
              topics.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm text-gray-400 font-mono">{t.id}</td>
                  <td className="px-6 py-3">
                    {editId === t.id ? (
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{t.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    {editId === t.id ? (
                      <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={inputClass} />
                    ) : (
                      <span className="text-sm text-gray-500">{t.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{t.problemCount ?? t.Problems?.length ?? '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {editId === t.id ? (
                        <>
                          <button onClick={() => handleUpdate(t.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(t.id); setEditForm({ name: t.name, description: t.description || '' }); }} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
