import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Question } from '@/lib/api';

interface CardProps {
  question: Question;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  timerProgress: number;
}

export function Card({ question, onSwipeLeft, onSwipeRight, timerProgress }: CardProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Reset swipe direction when question changes
  useEffect(() => {
    setSwipeDirection(null);
  }, [question.id]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection('left');
      setTimeout(() => onSwipeLeft(), 300);
    },
    onSwipedRight: () => {
      setSwipeDirection('right');
      setTimeout(() => onSwipeRight(), 300);
    },
    trackMouse: true,
    preventScrollOnSwipe: true
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSwipeDirection('left');
        setTimeout(() => onSwipeLeft(), 300);
      } else if (e.key === 'ArrowRight') {
        setSwipeDirection('right');
        setTimeout(() => onSwipeRight(), 300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Timer bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
          style={{ width: `${timerProgress}%` }}
        />
      </div>

      {/* Card */}
      <div
        {...handlers}
        className={`
          bg-white rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col items-center justify-center
          transition-transform duration-300 select-none touch-none
          ${swipeDirection === 'left' ? 'animate-swipe-left' : ''}
          ${swipeDirection === 'right' ? 'animate-swipe-right' : ''}
        `}
      >
        {question.imageUrl && (
          <div className="w-full mb-6 h-48 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={question.imageUrl}
              alt={question.prompt}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
          {question.prompt}
        </h2>

        <div className="flex gap-4 w-full mt-auto">
          <button
            onClick={() => {
              setSwipeDirection('left');
              setTimeout(() => onSwipeLeft(), 300);
            }}
            className="flex-1 py-4 px-6 bg-canada-600 hover:bg-canada-700 text-white rounded-xl font-bold text-lg shadow-lg transition-colors"
            aria-label="Canada"
          >
            🍁 Canada
          </button>
          <button
            onClick={() => {
              setSwipeDirection('right');
              setTimeout(() => onSwipeRight(), 300);
            }}
            className="flex-1 py-4 px-6 bg-usa-600 hover:bg-usa-700 text-white rounded-xl font-bold text-lg shadow-lg transition-colors"
            aria-label="USA"
          >
            🦅 USA
          </button>
        </div>
      </div>

      {/* Swipe hints */}
      <div className="flex justify-between mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>← or</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded">Left</kbd>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 rounded">Right</kbd>
          <span>or →</span>
        </div>
      </div>
    </div>
  );
}
