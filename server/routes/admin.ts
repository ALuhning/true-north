import { Router } from 'express';
import { Server } from 'socket.io';
import { z } from 'zod';
import { db } from '../db.js';

const ADMIN_CODE = process.env.ADMIN_PASSWORD || 'truenorth2024';

const adminActionSchema = z.object({
  code: z.string(),
  action: z.enum(['reset_daily', 'reset_all', 'delete_session', 'toggle_question']),
  questionId: z.string().optional(),
  sessionId: z.string().optional()
});

export function adminRouter(io: Server) {
  const router = Router();

  router.post('/reset', (req, res) => {
    try {
      const { code, action, questionId, sessionId } = adminActionSchema.parse(req.body);

      if (code !== ADMIN_CODE) {
        return res.status(403).json({ error: 'Invalid admin code' });
      }

      if (action === 'reset_daily') {
        const today = new Date().toISOString().split('T')[0];
        db.prepare('DELETE FROM leaderboard_daily WHERE date = ?').run(today);
        
        io.to('leaderboard').emit('leaderboard:update');
        
        return res.json({ success: true, message: 'Daily leaderboard reset' });
      }

      if (action === 'reset_all') {
        db.prepare('DELETE FROM leaderboard_daily').run();
        
        io.to('leaderboard').emit('leaderboard:update');
        
        return res.json({ success: true, message: 'All leaderboard entries cleared' });
      }

      if (action === 'delete_session' && sessionId) {
        // Delete from leaderboard
        db.prepare('DELETE FROM leaderboard_daily WHERE session_id = ?').run(sessionId);
        
        // Optionally delete session and answers
        db.prepare('DELETE FROM session_answers WHERE session_id = ?').run(sessionId);
        db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
        
        io.to('leaderboard').emit('leaderboard:update');
        
        return res.json({ success: true, message: 'Session deleted from leaderboard' });
      }

      if (action === 'toggle_question' && questionId) {
        const question = db.prepare('SELECT active FROM questions WHERE id = ?').get(questionId) as { active: number } | undefined;
        
        if (!question) {
          return res.status(404).json({ error: 'Question not found' });
        }

        const newActive = question.active === 1 ? 0 : 1;
        db.prepare('UPDATE questions SET active = ? WHERE id = ?').run(newActive, questionId);

        return res.json({ success: true, message: `Question ${newActive ? 'activated' : 'deactivated'}` });
      }

      res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input', details: error.errors });
      }
      console.error('Error in admin action:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all leaderboard entries for admin view
  router.get('/leaderboard', (req, res) => {
    try {
      const code = req.query.code as string;

      if (code !== ADMIN_CODE) {
        return res.status(403).json({ error: 'Invalid admin code' });
      }

      const entries = db.prepare(`
        SELECT 
          l.session_id,
          l.date,
          p.nickname,
          l.score,
          l.duration_ms,
          l.rank,
          s.start_time
        FROM leaderboard_daily l
        JOIN players p ON l.player_id = p.id
        JOIN sessions s ON l.session_id = s.id
        ORDER BY l.date DESC, l.score DESC, l.duration_ms ASC
        LIMIT 200
      `).all();

      res.json({ entries });
    } catch (error) {
      console.error('Error fetching admin leaderboard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
