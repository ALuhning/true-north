import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import { useGameStore } from '@/store';
import { Tutorial } from '@/components/Tutorial';
import { QRJoin } from '@/components/QRJoin';

export function Landing() {
  const navigate = useNavigate();
  const setPlayerId = useGameStore((state) => state.setPlayerId);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deviceId = getDeviceId();
      const { playerId, nickname: finalNickname } = await api.createPlayer({ nickname: nickname.trim(), deviceId });
      setPlayerId(playerId);
      
      // Show message if nickname was changed
      if (finalNickname !== nickname.trim()) {
        setNickname(finalNickname);
        // Brief delay to let user see their actual nickname
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setShowTutorial(true);
    } catch (err) {
      setError('Failed to create player. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    navigate('/play');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-canada-50 via-white to-usa-50 flex items-center justify-center p-4">
      {showTutorial && <Tutorial onClose={handleTutorialClose} />}

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-canada-600">True North</span>
            {' '}or{' '}
            <span className="text-usa-600">Not?</span>
          </h1>
          <p className="text-xl text-gray-600">
            🍁 Is it Canadian or American? 🦅
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium mb-2 text-gray-700">
                Your Nickname
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-canada-500 focus:outline-none text-lg"
                placeholder="Enter your name"
                maxLength={30}
                autoFocus
                disabled={loading}
              />
              {loading && nickname && (
                <p className="text-xs text-gray-500 mt-1">
                  Your leaderboard name: <span className="font-semibold">{nickname}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-canada-600 to-usa-600 hover:from-canada-700 hover:to-usa-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? 'Starting...' : 'Play Now! 🎮'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-2 border-gray-100 space-y-3">
            <div className="text-sm text-gray-600 text-center">
              • 20 questions per game<br />
              • Fast answers = bonus points<br />
              • Build streaks for max score
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/leaderboard')}
            className="px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-xl font-semibold transition-colors"
          >
            🏆 Leaderboard
          </button>
          <QRJoin />
        </div>
      </div>
    </div>
  );
}
