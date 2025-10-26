import { formatScore } from '@/lib/scoring';

interface HUDProps {
  score: number;
  streak: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function HUD({ score, streak, currentQuestion, totalQuestions }: HUDProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Score */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold text-gray-900">{formatScore(score)}</div>
          <div className="text-xs text-gray-500 uppercase">Score</div>
        </div>

        {/* Progress */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-sm font-medium text-gray-700">
            Question {currentQuestion} / {totalQuestions}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-gradient-to-r from-canada-500 to-usa-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            {streak > 0 && <span className="text-xl">🔥</span>}
            <div className="text-2xl font-bold text-orange-600">{streak}</div>
          </div>
          <div className="text-xs text-gray-500 uppercase">Streak</div>
        </div>
      </div>
    </div>
  );
}
