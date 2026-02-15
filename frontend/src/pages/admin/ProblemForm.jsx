import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Save, Plus, Trash2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProblemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    description: '',
    input_description: '',
    output_description: '',
    difficulty: 'EASY',
    topic_id: '',
    time_limit: 2,
    memory_limit: 256,
  });
  const [topics, setTopics] = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [newTc, setNewTc] = useState({ input: '', expected_output: '', is_sample: false });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get('/admin/topics').then((res) => setTopics(res.data));
    if (isEdit) {
      api.get(`/admin/problems/${id}`)
        .then((res) => {
          const p = res.data;
          setForm({
            title: p.title,
            description: p.description,
            input_description: p.input_description || '',
            output_description: p.output_description || '',
            difficulty: p.difficulty,
            topic_id: p.topic_id || '',
            time_limit: p.time_limit,
            memory_limit: p.memory_limit,
          });
          setTestcases(p.Testcases || []);
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
      const payload = { ...form, topic_id: form.topic_id || null };
      if (isEdit) {
        await api.put(`/admin/problems/${id}`, payload);
        toast.success('Problem updated');
      } else {
        const res = await api.post('/admin/problems', payload);
        toast.success('Problem created');
        navigate(`/admin/problems/${res.data.id}/edit`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addTestcase = async () => {
    if (!newTc.input && !newTc.expected_output) return;
    try {
      await api.post(`/admin/problems/${id}/testcases`, newTc);
      toast.success('Testcase added');
      setNewTc({ input: '', expected_output: '', is_sample: false });
      const res = await api.get(`/admin/problems/${id}`);
      setTestcases(res.data.Testcases || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add testcase');
    }
  };

  const deleteTestcase = async (tcId) => {
    try {
      await api.delete(`/admin/problems/${id}/testcases/${tcId}`);
      setTestcases(testcases.filter((t) => t.id !== tcId));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
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
      <button onClick={() => navigate('/admin/problems')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">{isEdit ? 'Edit Problem' : 'New Problem'}</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Difficulty</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className={inputClass}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} required className={inputClass} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Input Description</label>
            <textarea name="input_description" value={form.input_description} onChange={handleChange} rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Output Description</label>
            <textarea name="output_description" value={form.output_description} onChange={handleChange} rows={3} className={inputClass} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
            <select name="topic_id" value={form.topic_id} onChange={handleChange} className={inputClass}>
              <option value="">None</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Limit (s)</label>
            <input name="time_limit" type="number" value={form.time_limit} onChange={handleChange} min={1} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Memory Limit (MB)</label>
            <input name="memory_limit" type="number" value={form.memory_limit} onChange={handleChange} min={1} className={inputClass} />
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </form>

      {/* Testcases section - only in edit mode */}
      {isEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Testcases ({testcases.length})</h3>

          {testcases.length > 0 && (
            <div className="space-y-2 mb-4">
              {testcases.map((tc) => (
                <div key={tc.id} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4 flex-1 min-w-0">
                    <div>
                      <span className="text-xs font-semibold text-gray-400">Input</span>
                      <pre className="text-xs font-mono text-gray-700 mt-1 whitespace-pre-wrap truncate">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400">Expected Output</span>
                      <pre className="text-xs font-mono text-gray-700 mt-1 whitespace-pre-wrap truncate">{tc.expected_output}</pre>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {tc.is_sample && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Sample</span>}
                    <button onClick={() => deleteTestcase(tc.id)} className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add Testcase</h4>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Input</label>
                <textarea
                  value={newTc.input}
                  onChange={(e) => setNewTc({ ...newTc, input: e.target.value })}
                  rows={3}
                  className={inputClass + ' font-mono text-xs'}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expected Output</label>
                <textarea
                  value={newTc.expected_output}
                  onChange={(e) => setNewTc({ ...newTc, expected_output: e.target.value })}
                  rows={3}
                  className={inputClass + ' font-mono text-xs'}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={newTc.is_sample}
                  onChange={(e) => setNewTc({ ...newTc, is_sample: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Sample testcase (visible to users)
              </label>
              <button
                type="button"
                onClick={addTestcase}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
