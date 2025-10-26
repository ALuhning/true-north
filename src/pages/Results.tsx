import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useGameStore } from '@/store';
import { formatScore, formatDuration } from '@/lib/scoring';

export function Results() {
  const navigate = useNavigate();
  const { sessionId, answers, reset } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    score: number;
    durationMs: number;
    rank: number;
    shareText: string;
  } | null>(null);

  useEffect(() => {
    const finishSession = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        const response = await api.finishSession({ sessionId });
        setResults(response);
      } catch (error) {
        console.error('Failed to finish session:', error);
      } finally {
        setLoading(false);
      }
    };

    finishSession();
  }, [sessionId, navigate]);

  const handleShare = () => {
    if (!results) return;

    if (navigator.share) {
      navigator.share({
        title: 'True North or Not?',
        text: results.shareText,
        url: window.location.origin
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${results.shareText}\n\n${window.location.origin}`);
      alert('Results copied to clipboard!');
    }
  };

  const handlePlayAgain = () => {
    reset();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-xl font-semibold text-gray-700">Calculating results...</div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const correctCount = answers.filter(a => a.correct).length;
  const accuracy = ((correctCount / answers.length) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">🎉 Game Complete!</h1>
            <p className="text-gray-600">Here's how you did</p>
          </div>

          {/* Score */}
          <div className="bg-gradient-to-r from-canada-100 to-usa-100 rounded-xl p-8 mb-6 text-center">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {formatScore(results.score)}
            </div>
            <div className="text-xl text-gray-700 font-medium">Total Points</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{correctCount}/{answers.length}</div>
              <div className="text-sm text-gray-600 mt-1">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{accuracy}%</div>
              <div className="text-sm text-gray-600 mt-1">Accuracy</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">#{results.rank}</div>
              <div className="text-sm text-gray-600 mt-1">Rank</div>
            </div>
          </div>

          {/* Time */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <div className="text-2xl font-bold text-gray-900">{formatDuration(results.durationMs)}</div>
            <div className="text-sm text-gray-600 mt-1">Total Time</div>
          </div>

          {/* Rank message */}
          {results.rank === 1 && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 mb-6 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-bold text-yellow-900">You're #1 on the leaderboard!</div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gradient-to-r from-canada-600 to-usa-600 hover:from-canada-700 hover:to-usa-700 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              📤 Share Results
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl font-semibold transition-colors"
            >
              🏆 View Leaderboard
            </button>
            <button
              onClick={handlePlayAgain}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-colors"
            >
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
