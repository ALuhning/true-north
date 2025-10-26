import { Router } from 'express';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';

const startSessionSchema = z.object({
  playerId: z.string().uuid(),
  deviceId: z.string().uuid()
});

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  latencyMs: z.number().min(0).max(60000),
  guess: z.enum(['CAN', 'USA'])
});

const finishSessionSchema = z.object({
  sessionId: z.string().uuid()
});

interface Question {
  id: string;
  prompt: string;
  answer: string;
  explanation: string;
  image_url: string | null;
}

export function sessionRouter(io: Server) {
  const router = Router();

  // Start a new session
  router.post('/start', (req, res) => {
    try {
      const { playerId, deviceId } = startSessionSchema.parse(req.body);

      console.log(`Starting session for player ${playerId}, device ${deviceId}`);

      // Verify player exists
      const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
      if (!player) {
        console.error(`Player not found: ${playerId}`);
        return res.status(404).json({ error: 'Player not found' });
      }

      // Check for active session - if it has no answers yet, return it
      const activeSession = db.prepare(
        'SELECT id FROM sessions WHERE device_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1'
      ).get(deviceId) as { id: string } | undefined;

      if (activeSession) {
        // Check if this session has any answers
        const answerCount = db.prepare(
          'SELECT COUNT(*) as count FROM session_answers WHERE session_id = ?'
        ).get(activeSession.id) as { count: number };

        // If no answers yet, it's safe to reuse (React StrictMode double render)
        if (answerCount.count === 0) {
          console.log(`Reusing session ${activeSession.id} (no answers yet)`);
          // Get the questions for this session by re-querying
          // (we need to get them again since we don't store the deck)
          const canQuestions = db.prepare(
            "SELECT * FROM questions WHERE answer = 'CAN' AND active = 1 ORDER BY RANDOM() LIMIT 10"
          ).all() as Question[];

          const usaQuestions = db.prepare(
            "SELECT * FROM questions WHERE answer = 'USA' AND active = 1 ORDER BY RANDOM() LIMIT 10"
          ).all() as Question[];

          const allQuestions = [...canQuestions, ...usaQuestions]
            .sort(() => Math.random() - 0.5)
            .slice(0, 20);

          const deck = allQuestions.map((q, index) => ({
            id: q.id,
            prompt: q.prompt,
            imageUrl: q.image_url,
            orderIndex: index
          }));

          return res.json({ sessionId: activeSession.id, deck });
        } else {
          // Session has answers - finish it automatically and start a new one
          console.log(`Auto-finishing active session ${activeSession.id} with ${answerCount.count} answers to allow new game`);
          
          const oldSession = db.prepare(
            'SELECT * FROM sessions WHERE id = ?'
          ).get(activeSession.id) as { id: string; player_id: string; start_time: number; score: number } | undefined;

          if (oldSession && oldSession.start_time) {
            const endTime = Date.now();
            const durationMs = endTime - oldSession.start_time;

            // Finish the old session
            db.prepare(
              'UPDATE sessions SET end_time = ?, duration_ms = ? WHERE id = ?'
            ).run(endTime, durationMs, activeSession.id);

            console.log(`Old session ${activeSession.id} auto-finished`);
          }
          // Continue to create new session below
        }
      }

      // Get 20 random active questions (balanced CAN/USA)
      const canQuestions = db.prepare(
        "SELECT * FROM questions WHERE answer = 'CAN' AND active = 1 ORDER BY RANDOM() LIMIT 10"
      ).all() as Question[];

      const usaQuestions = db.prepare(
        "SELECT * FROM questions WHERE answer = 'USA' AND active = 1 ORDER BY RANDOM() LIMIT 10"
      ).all() as Question[];

      console.log(`Found ${canQuestions.length} Canadian and ${usaQuestions.length} American questions`);

      const allQuestions = [...canQuestions, ...usaQuestions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);

      if (allQuestions.length < 20) {
        console.error(`Not enough questions: ${allQuestions.length}/20`);
        return res.status(500).json({ error: `Not enough active questions (${allQuestions.length}/20 available)` });
      }

      // Create session
      const sessionId = uuidv4();
      const startTime = Date.now();

      db.prepare(
        'INSERT INTO sessions (id, player_id, device_id, start_time) VALUES (?, ?, ?, ?)'
      ).run(sessionId, playerId, deviceId, startTime);

      console.log(`Created session ${sessionId}`);

      // Return deck without answers
      const deck = allQuestions.map((q, index) => ({
        id: q.id,
        prompt: q.prompt,
        imageUrl: q.image_url,
        orderIndex: index
      }));

      res.json({ sessionId, deck });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error starting session:', error);
      res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Submit an answer
  router.post('/answer', (req, res) => {
    try {
      const { sessionId, questionId, latencyMs, guess } = answerSchema.parse(req.body);

      // Get session
      const session = db.prepare(
        'SELECT * FROM sessions WHERE id = ? AND end_time IS NULL'
      ).get(sessionId) as { id: string; score: number } | undefined;

      if (!session) {
        return res.status(404).json({ error: 'Session not found or already finished' });
      }

      // Get question
      const question = db.prepare(
        'SELECT * FROM questions WHERE id = ?'
      ).get(questionId) as Question | undefined;

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      // Check if already answered
      const existing = db.prepare(
        'SELECT 1 FROM session_answers WHERE session_id = ? AND question_id = ?'
      ).get(sessionId, questionId);

      if (existing) {
        return res.status(400).json({ error: 'Question already answered' });
      }

      // Calculate correctness
      const correct = guess === question.answer;

      // Get current streak
      const answers = db.prepare(
        'SELECT correct FROM session_answers WHERE session_id = ? ORDER BY order_index DESC'
      ).all(sessionId) as { correct: number }[];

      let streak = 0;
      for (const ans of answers) {
        if (ans.correct === 1) {
          streak++;
        } else {
          break;
        }
      }

      if (correct) {
        streak++;
      } else {
        streak = 0;
      }

      // Calculate points
      let pointsAwarded = 0;
      if (correct) {
        // Base points
        pointsAwarded = 100;

        // Time bonus (linear decay from 50 to 0 over 6 seconds)
        const timeBonus = Math.max(0, Math.floor(50 * (1 - latencyMs / 6000)));
        pointsAwarded += timeBonus;

        // Streak bonus (capped at 50)
        const streakBonus = Math.min(50, streak * 10);
        pointsAwarded += streakBonus;
      }

      // Get order index
      const orderIndex = db.prepare(
        'SELECT COUNT(*) as count FROM session_answers WHERE session_id = ?'
      ).get(sessionId) as { count: number };

      // Save answer
      db.prepare(
        'INSERT INTO session_answers (session_id, question_id, correct, latency_ms, order_index) VALUES (?, ?, ?, ?, ?)'
      ).run(sessionId, questionId, correct ? 1 : 0, latencyMs, orderIndex.count);

      // Update session score
      db.prepare(
        'UPDATE sessions SET score = score + ? WHERE id = ?'
      ).run(pointsAwarded, sessionId);

      const newScore = (session.score || 0) + pointsAwarded;

      res.json({
        correct,
        correctAnswer: question.answer,
        explanation: question.explanation,
        pointsAwarded,
        streak,
        runningScore: newScore
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Finish session
  router.post('/finish', (req, res) => {
    try {
      const { sessionId } = finishSessionSchema.parse(req.body);

      const session = db.prepare(
        'SELECT * FROM sessions WHERE id = ? AND end_time IS NULL'
      ).get(sessionId) as { id: string; player_id: string; start_time: number; score: number } | undefined;

      if (!session) {
        return res.status(404).json({ error: 'Session not found or already finished' });
      }

      const endTime = Date.now();
      const durationMs = endTime - session.start_time;

      // Update session
      db.prepare(
        'UPDATE sessions SET end_time = ?, duration_ms = ? WHERE id = ?'
      ).run(endTime, durationMs, sessionId);

      // Add to leaderboard
      const today = new Date().toISOString().split('T')[0];
      db.prepare(
        'INSERT INTO leaderboard_daily (date, session_id, player_id, score, duration_ms) VALUES (?, ?, ?, ?, ?)'
      ).run(today, sessionId, session.player_id, session.score, durationMs);

      // Get rank estimate
      const rank = db.prepare(
        'SELECT COUNT(*) + 1 as rank FROM leaderboard_daily WHERE date = ? AND (score > ? OR (score = ? AND duration_ms < ?))'
      ).get(today, session.score, session.score, durationMs) as { rank: number };

      // Update leaderboard ranks
      updateLeaderboardRanks(today);

      // Emit leaderboard update
      io.to('leaderboard').emit('leaderboard:update');

      const player = db.prepare('SELECT nickname FROM players WHERE id = ?').get(session.player_id) as { nickname: string };

      const shareText = `I scored ${session.score} points on True North or Not! 🍁🦅 Can you beat my score?`;

      res.json({
        score: session.score,
        durationMs,
        rank: rank.rank,
        shareText
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error finishing session:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

function updateLeaderboardRanks(date: string) {
  const entries = db.prepare(
    'SELECT session_id FROM leaderboard_daily WHERE date = ? ORDER BY score DESC, duration_ms ASC'
  ).all(date) as { session_id: string }[];

  const updateRank = db.prepare('UPDATE leaderboard_daily SET rank = ? WHERE session_id = ?');

  entries.forEach((entry, index) => {
    updateRank.run(index + 1, entry.session_id);
  });
}
