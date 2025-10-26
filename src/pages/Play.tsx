import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { getDeviceId, setLastSession } from '@/lib/device';
import { useGameStore } from '@/store';
import { Card } from '@/components/Card';
import { HUD } from '@/components/HUD';

export function Play() {
  const navigate = useNavigate();
  const {
    playerId,
    sessionId,
    deck,
    currentIndex,
    score,
    streak,
    setSession,
    recordAnswer,
    nextQuestion,
    isComplete
  } = useGameStore();

  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timerProgress, setTimerProgress] = useState(100);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  // Initialize session
  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      if (!playerId) {
        navigate('/');
        return;
      }

      if (sessionId && deck.length > 0) {
        setLoading(false);
        return;
      }

      try {
        const deviceId = getDeviceId();
        const response = await api.startSession({ playerId, deviceId });
        
        if (!cancelled) {
          setSession(response.sessionId, response.deck);
          setLastSession(response.sessionId);
          setQuestionStartTime(Date.now());
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to start session:', error);
          alert('Failed to start game. Please try again.');
          navigate('/');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [playerId, sessionId, deck.length, setSession, navigate]);

  // Timer countdown
  useEffect(() => {
    if (loading || feedback) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - questionStartTime;
      const progress = Math.max(0, 100 - (elapsed / 6000) * 100);
      setTimerProgress(progress);
    }, 50);

    return () => clearInterval(interval);
  }, [questionStartTime, loading, feedback]);

  // Check if game is complete
  useEffect(() => {
    if (isComplete() && !loading) {
      navigate('/results');
    }
  }, [currentIndex, isComplete, loading, navigate]);

  const handleAnswer = async (guess: 'CAN' | 'USA') => {
    if (!sessionId || feedback) return;

    const latencyMs = Date.now() - questionStartTime;
    const currentQuestion = deck[currentIndex];

    try {
      const response = await api.submitAnswer({
        sessionId,
        questionId: currentQuestion.id,
        latencyMs,
        guess
      });

      recordAnswer(response);
      setFeedback({
        correct: response.correct,
        explanation: response.explanation
      });

      // Move to next question after showing feedback
      setTimeout(() => {
        setFeedback(null);
        nextQuestion();
        setQuestionStartTime(Date.now());
        setTimerProgress(100);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <div className="text-xl font-semibold text-gray-700">Loading game...</div>
        </div>
      </div>
    );
  }

  if (deck.length === 0) {
    return null;
  }

  const currentQuestion = deck[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-canada-50 to-usa-50 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <HUD
          score={score}
          streak={streak}
          currentQuestion={currentIndex + 1}
          totalQuestions={deck.length}
        />

        {feedback ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className={`text-6xl mb-4 ${feedback.correct ? 'animate-bounce' : ''}`}>
              {feedback.correct ? '✅' : '❌'}
            </div>
            <div className={`text-2xl font-bold mb-4 ${feedback.correct ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.correct ? 'Correct!' : 'Not quite!'}
            </div>
            <div className="text-gray-700 text-lg">
              {feedback.explanation}
            </div>
          </div>
        ) : (
          <Card
            question={currentQuestion}
            onSwipeLeft={() => handleAnswer('CAN')}
            onSwipeRight={() => handleAnswer('USA')}
            timerProgress={timerProgress}
          />
        )}
      </div>
    </div>
  );
}
