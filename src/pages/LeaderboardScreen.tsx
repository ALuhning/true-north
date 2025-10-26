import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api, LeaderboardEntry } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { Leaderboard } from '@/components/Leaderboard';
import { getLastSession } from '@/lib/device';

export function LeaderboardScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isKiosk = searchParams.get('kiosk') === 'true';

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<'today' | 'all'>('today');
  const [loading, setLoading] = useState(true);
  const lastSessionId = getLastSession();

  const fetchLeaderboard = async () => {
    try {
      const response = await api.getLeaderboard(period);
      setEntries(response.entries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    
    // Connect to WebSocket for live updates
    socketClient.connect();
    socketClient.subscribeToLeaderboard();
    socketClient.onLeaderboardUpdate(fetchLeaderboard);

    return () => {
      socketClient.offLeaderboardUpdate(fetchLeaderboard);
      if (!isKiosk) {
        socketClient.disconnect();
      }
    };
  }, [period, isKiosk]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <div className="text-xl font-semibold text-gray-700">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  if (isKiosk) {
    // Kiosk mode: fullscreen leaderboard for big screens
    return (
      <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4">
              <span className="text-canada-600">True North</span> or <span className="text-usa-600">Not?</span>
            </h1>
            <p className="text-2xl text-gray-600">🏆 Top Players</p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Leaderboard */}
            <div className="col-span-2 bg-white/90 rounded-3xl shadow-2xl p-8">
              <Leaderboard entries={entries.slice(0, 10)} />
            </div>

            {/* QR Code */}
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold mb-6 text-center">Scan to Play!</h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <QRCodeSVG 
                  value={window.location.origin} 
                  size={280} 
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-center text-gray-600 mt-6 text-lg font-medium">
                {window.location.origin}
              </p>
              <div className="mt-6 text-center text-gray-500">
                <p className="text-xl font-semibold mb-2">📱 Join the Game!</p>
                <p className="text-sm">Test your knowledge:<br />Canadian or American?</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Period selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPeriod('today')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                period === 'today'
                  ? 'bg-gradient-to-r from-canada-600 to-usa-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                period === 'all'
                  ? 'bg-gradient-to-r from-canada-600 to-usa-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>

          <Leaderboard entries={entries} highlightSessionId={lastSessionId || undefined} />

          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 py-3 bg-gradient-to-r from-canada-600 to-usa-600 hover:from-canada-700 hover:to-usa-700 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            🎮 Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
