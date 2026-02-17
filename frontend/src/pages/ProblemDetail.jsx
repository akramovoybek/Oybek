import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Play, Clock, HardDrive, CheckCircle2, XCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const verdictStyle = {
  ACCEPTED: 'text-emerald-600 bg-emerald-50',
  WRONG_ANSWER: 'text-red-600 bg-red-50',
  RUNTIME_ERROR: 'text-orange-600 bg-orange-50',
  TIME_LIMIT_EXCEEDED: 'text-amber-600 bg-amber-50',
  MEMORY_LIMIT_EXCEEDED: 'text-purple-600 bg-purple-50',
  COMPILATION_ERROR: 'text-red-600 bg-red-50',
  PENDING: 'text-gray-600 bg-gray-50',
};

const verdictLabel = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  RUNTIME_ERROR: 'Runtime Error',
  TIME_LIMIT_EXCEEDED: 'Time Limit',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit',
  COMPILATION_ERROR: 'Compilation Error',
  PENDING: 'Pending',
};

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('# Write your Python solution here\n\n');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [tab, setTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/problems/${id}`)
      .then((res) => setProblem(res.data))
      .finally(() => setLoading(false));

    if (user) {
      api.get('/submissions', { params: { problem_id: id } })
        .then((res) => setSubmissions(res.data.submissions))
        .catch(() => {});
    }
  }, [id, user]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to submit');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await api.post('/submissions', {
        problem_id: parseInt(id),
        code,
        language: 'python',
      });
      const submission = res.data.submission;
      setResult(submission);
      if (submission.verdict === 'ACCEPTED') {
        toast.success('Accepted!');
      } else {
        toast.error(verdictLabel[submission.verdict] || submission.verdict);
      }
      // Refresh submissions
      api.get('/submissions', { params: { problem_id: id } })
        .then((r) => setSubmissions(r.data.submissions))
        .catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Problem not found</p>
      </div>
    );
  }

  const diffColor = { EASY: 'text-emerald-600', MEDIUM: 'text-amber-600', HARD: 'text-red-600' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Link to="/problems" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back to Problems
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Problem description */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-gray-900">{problem.title}</h1>
              <span className={`text-xs font-semibold ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {problem.time_limit}s</span>
              <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> {problem.memory_limit}MB</span>
              {problem.Topic && <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">{problem.Topic.name}</span>}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex gap-4 border-b border-gray-100 mb-4">
              {['description', 'submissions'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-2.5 text-sm font-medium capitalize transition-colors ${
                    tab === t ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === 'description' ? (
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                  <p className="whitespace-pre-wrap">{problem.description}</p>
                </div>
                {problem.input_description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Input</h3>
                    <p className="whitespace-pre-wrap">{problem.input_description}</p>
                  </div>
                )}
                {problem.output_description && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Output</h3>
                    <p className="whitespace-pre-wrap">{problem.output_description}</p>
                  </div>
                )}
                {problem.sampleTestcases?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Examples</h3>
                    {problem.sampleTestcases.map((tc, i) => (
                      <div key={i} className="mb-3 rounded-xl overflow-hidden border border-gray-100">
                        <div className="grid grid-cols-2 divide-x divide-gray-100">
                          <div className="p-3">
                            <div className="text-xs font-semibold text-gray-400 mb-1">Input</div>
                            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{tc.input}</pre>
                          </div>
                          <div className="p-3">
                            <div className="text-xs font-semibold text-gray-400 mb-1">Output</div>
                            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{tc.expected_output}</pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {submissions.length === 0 ? (
                  <p className="text-sm text-gray-400 py-8 text-center">No submissions yet</p>
                ) : (
                  submissions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${verdictStyle[s.verdict]}`}>
                          {verdictLabel[s.verdict]}
                        </span>
                        {s.passed_testcases !== undefined && (
                          <span className="text-xs text-gray-400">{s.passed_testcases}/{s.total_testcases} passed</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Code editor */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Python 3</span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {submitting ? 'Running...' : 'Submit'}
              </button>
            </div>
            <CodeMirror
              value={code}
              height="400px"
              extensions={[python()]}
              onChange={(value) => setCode(value)}
              theme="light"
              className="text-sm"
            />
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-2xl border p-5 ${
              result.verdict === 'ACCEPTED'
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-red-50/50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {result.verdict === 'ACCEPTED' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold text-sm ${
                  result.verdict === 'ACCEPTED' ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {verdictLabel[result.verdict]}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                {result.passed_testcases !== undefined && (
                  <span>Tests: {result.passed_testcases}/{result.total_testcases}</span>
                )}
                {result.execution_time && <span>Time: {result.execution_time}ms</span>}
                {result.memory_used && <span>Memory: {result.memory_used}MB</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
