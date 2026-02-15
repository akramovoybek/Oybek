import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Save, Plus, Trash2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [contestProblems, setContestProblems] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/admin/problems').then((res) => setAllProblems(res.data));
    if (isEdit) {
      api.get(`/admin/contests/${id}`)
        .then((res) => {
          const c = res.data;
          setForm({
            title: c.title,
            description: c.description || '',
            start_time: c.start_time ? c.start_time.slice(0, 16) : '',
            end_time: c.end_time ? c.end_time.slice(0, 16) : '',
          });
          setContestProblems(c.problems || c.Problems || []);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/admin/contests/${id}`, form);
        toast.success('Contest updated');
      } else {
        const res = await api.post('/admin/contests', form);
        toast.success('Contest created');
        navigate(`/admin/contests/${res.data.id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addProblem = async () => {
    if (!selectedProblemId) return;
    try {
      await api.post(`/admin/contests/${id}/problems`, { problem_id: parseInt(selectedProblemId) });
      toast.success('Problem added');
      const res = await api.get(`/admin/contests/${id}`);
      setContestProblems(res.data.problems || res.data.Problems || []);
      setSelectedProblemId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const removeProblem = async (pid) => {
    try {
      await api.delete(`/admin/contests/${id}/problems/${pid}`);
      setContestProblems(contestProblems.filter((p) => p.id !== pid));
      toast.success('Removed');
    } catch (err) {
      toast.error('Remove failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all";

  return (
    <div>
      <button onClick={() => navigate('/admin/contests')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Contest' : 'New Contest'}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
            <input name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
            <input name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} required className={inputClass} />
          </div>
        </div>
        <div className="pt-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Contest'}
          </button>
        </div>
      </form>

      {isEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Contest Problems ({contestProblems.length})</h3>

          {contestProblems.length > 0 && (
            <div className="space-y-2 mb-4">
              {contestProblems.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-gray-400">{String.fromCharCode(65 + i)}</span>
                    <span className="text-sm font-medium text-gray-900">{p.title}</span>
                  </div>
                  <button onClick={() => removeProblem(p.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a problem...</option>
              {allProblems
                .filter((p) => !contestProblems.some((cp) => cp.id === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
            </select>
            <button
              type="button"
              onClick={addProblem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
