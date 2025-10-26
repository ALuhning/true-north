import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

interface LeaderboardEntry {
  nickname: string;
  score: number;
  duration_ms: number;
  rank: number;
  session_id: string;
}

router.get('/', (req, res) => {
  try {
    const period = req.query.period === 'all' ? 'all' : 'today';
    const today = new Date().toISOString().split('T')[0];

    let entries: LeaderboardEntry[];

    if (period === 'today') {
      entries = db.prepare(`
        SELECT p.nickname, l.score, l.duration_ms, l.rank, l.session_id
        FROM leaderboard_daily l
        JOIN players p ON l.player_id = p.id
        WHERE l.date = ?
        ORDER BY l.score DESC, l.duration_ms ASC
        LIMIT 50
      `).all(today) as LeaderboardEntry[];
    } else {
      entries = db.prepare(`
        SELECT p.nickname, l.score, l.duration_ms, l.rank, l.session_id
        FROM leaderboard_daily l
        JOIN players p ON l.player_id = p.id
        ORDER BY l.score DESC, l.duration_ms ASC
        LIMIT 50
      `).all() as LeaderboardEntry[];
    }

    res.json({ entries, period });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as leaderboardRouter };
