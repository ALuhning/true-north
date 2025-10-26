import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { QRJoin } from './QRJoin';
import { QuestionEditor } from './QuestionEditor';
import { formatScore, formatDuration } from '@/lib/scoring';

// Note: Password is verified server-side via ADMIN_PASSWORD env variable
// This hardcoded value is only for local development convenience
const ADMIN_CODE = 'truenorth2024';

export function AdminPad() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'questions'>('leaderboard');
  const [entries, setEntries] = useState<Array<{
    session_id: string;
    date: string;
    nickname: string;
    score: number;
    duration_ms: number;
    rank: number;
    start_time: number;
  }>>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [questions, setQuestions] = useState<Array<{
    id: string;
    prompt: string;
    answer: 'CAN' | 'USA';
    explanation: string;
    tags: string;
    image_url: string | null;
    active: number;
  }>>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [showNewQuestion, setShowNewQuestion] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setAuthenticated(true);
      setMessage('');
      loadEntries();
      loadQuestions();
    } else {
      setMessage('Invalid code');
    }
  };

  const loadEntries = async () => {
    setLoadingEntries(true);
    try {
      const result = await api.getAdminLeaderboard(code);
      setEntries(result.entries);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load entries');
    } finally {
      setLoadingEntries(false);
    }
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const result = await api.getAdminQuestions(code);
      setQuestions(result.questions);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleResetDaily = async () => {
    if (!confirm('Are you sure you want to reset today\'s leaderboard?')) return;

    setLoading(true);
    try {
      const result = await api.adminAction(code, 'reset_daily');
      setMessage(result.message);
      loadEntries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('⚠️ Are you sure you want to DELETE ALL leaderboard entries? This cannot be undone!')) return;

    setLoading(true);
    try {
      const result = await api.adminAction(code, 'reset_all');
      setMessage(result.message);
      loadEntries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to reset');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, nickname: string) => {
    if (!confirm(`Delete ${nickname}'s score? This will remove it from the leaderboard.`)) return;

    setLoading(true);
    try {
      const result = await api.adminAction(code, 'delete_session', undefined, sessionId);
      setMessage(result.message);
      loadEntries();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestion = async (questionId: string) => {
    setLoading(true);
    try {
      const result = await api.adminAction(code, 'toggle_question', questionId);
      setMessage(result.message);
      loadQuestions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to toggle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string, prompt: string) => {
    if (!confirm(`Delete question "${prompt}"? This cannot be undone.`)) return;

    setLoading(true);
    try {
      const result = await api.deleteQuestion(code, questionId);
      setMessage(result.message);
      loadQuestions();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">🔐 Admin Panel</h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Code</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-canada-500 focus:outline-none"
                placeholder="Enter admin code"
                autoFocus
              />
            </div>

            {message && (
              <div className="text-red-600 text-sm text-center">{message}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Unlock
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Game
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = editingQuestion ? questions.find(q => q.id === editingQuestion) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">⚙️ Admin Panel</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-xl">
              {message}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-b-4 border-canada-600 text-canada-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏆 Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === 'questions'
                  ? 'border-b-4 border-usa-600 text-usa-600 -mb-0.5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ❓ Questions
            </button>
          </div>

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">🏆 Leaderboard Management</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleResetDaily}
                    disabled={loading}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Reset Today\'s Leaderboard'}
                  </button>
                  <button
                    onClick={handleResetAll}
                    disabled={loading}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-bold transition-colors"
                  >
                    {loading ? 'Resetting...' : '⚠️ Delete ALL Leaderboard Entries'}
                  </button>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">📋 All Entries</h2>
                  <button
                    onClick={loadEntries}
                    disabled={loadingEntries}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    {loadingEntries ? 'Loading...' : '🔄 Refresh'}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {loadingEntries ? (
                    <div className="text-center py-8 text-gray-500">Loading entries...</div>
                  ) : entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No entries yet</div>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.session_id}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">{entry.nickname}</span>
                            <span className="text-sm text-gray-500">{entry.date}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Score: {formatScore(entry.score)}</span>
                            <span>Time: {formatDuration(entry.duration_ms)}</span>
                            <span>Rank: #{entry.rank}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(entry.session_id, entry.nickname)}
                          disabled={loading}
                          className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-400 rounded font-medium text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">📱 QR Code</h2>
                <QRJoin />
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">🖥️ Kiosk Mode</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Display leaderboard on a big screen
                </p>
                <button
                  onClick={() => {
                    window.open('/leaderboard?kiosk=true', '_blank', 'fullscreen=yes');
                  }}
                  className="w-full py-3 bg-usa-600 hover:bg-usa-700 text-white rounded-xl font-bold transition-colors"
                >
                  Launch Kiosk Screen
                </button>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {(showNewQuestion || editingQuestion) && (
                <QuestionEditor
                  code={code}
                  question={currentQuestion}
                  onSave={() => {
                    setEditingQuestion(null);
                    setShowNewQuestion(false);
                    loadQuestions();
                  }}
                  onCancel={() => {
                    setEditingQuestion(null);
                    setShowNewQuestion(false);
                  }}
                  setMessage={setMessage}
                />
              )}

              <div className="border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">❓ All Questions ({questions.length})</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={loadQuestions}
                      disabled={loadingQuestions}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg font-medium transition-colors"
                    >
                      {loadingQuestions ? 'Loading...' : '🔄 Refresh'}
                    </button>
                    <button
                      onClick={() => setShowNewQuestion(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                    >
                      + New Question
                    </button>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {loadingQuestions ? (
                    <div className="text-center py-8 text-gray-500">Loading questions...</div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No questions yet</div>
                  ) : (
                    questions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {q.image_url && (
                          <div className="w-24 h-24 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                            <img
                              src={q.image_url}
                              alt={q.prompt}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{q.prompt}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              q.answer === 'CAN' ? 'bg-canada-100 text-canada-700' : 'bg-usa-100 text-usa-700'
                            }`}>
                              {q.answer === 'CAN' ? '🍁 CAN' : '🦅 USA'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              q.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {q.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{q.explanation}</p>
                          {q.tags && (
                            <p className="text-xs text-gray-500">Tags: {q.tags}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                          <button
                            onClick={() => setEditingQuestion(q.id)}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleQuestion(q.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 disabled:bg-gray-200 text-yellow-700 disabled:text-gray-400 rounded font-medium text-sm transition-colors"
                          >
                            {q.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id, q.prompt)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-700 disabled:text-gray-400 rounded font-medium text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
