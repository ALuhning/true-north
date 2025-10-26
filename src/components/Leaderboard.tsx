import { LeaderboardEntry } from '@/lib/api';
import { formatScore, formatDuration } from '@/lib/scoring';
import clsx from 'clsx';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  highlightSessionId?: string;
  showRank?: boolean;
}

export function Leaderboard({ entries, highlightSessionId, showRank = true }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-2">🏆</div>
        <div>No entries yet. Be the first!</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isHighlighted = entry.session_id === highlightSessionId;
        const isTie = index > 0 && entries[index - 1].score === entry.score;

        return (
          <div
            key={entry.session_id}
            className={clsx(
              'flex items-center gap-4 p-4 rounded-xl transition-all',
              isHighlighted
                ? 'bg-gradient-to-r from-canada-100 to-usa-100 ring-2 ring-canada-500'
                : 'bg-white hover:bg-gray-50'
            )}
          >
            {/* Rank */}
            {showRank && (
              <div className="flex-shrink-0 w-12 text-center">
                {index === 0 && <span className="text-3xl">🥇</span>}
                {index === 1 && <span className="text-3xl">🥈</span>}
                {index === 2 && <span className="text-3xl">🥉</span>}
                {index > 2 && (
                  <div className="text-lg font-bold text-gray-500">
                    {isTie ? '=' : `#${index + 1}`}
                  </div>
                )}
              </div>
            )}

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {entry.nickname}
              </div>
              <div className="text-sm text-gray-500">
                {formatDuration(entry.duration_ms)}
              </div>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-right">
              <div className="text-xl font-bold text-gray-900">
                {formatScore(entry.score)}
              </div>
              {isTie && (
                <div className="text-xs text-orange-600 font-medium">TIE</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
