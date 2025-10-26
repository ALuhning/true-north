import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db } from '../db.js';

const router = Router();

const createPlayerSchema = z.object({
  nickname: z.string().min(1).max(30),
  deviceId: z.string().uuid()
});

router.post('/', (req, res) => {
  try {
    const { nickname, deviceId } = createPlayerSchema.parse(req.body);

    // Check if player exists with this deviceId
    const existing = db.prepare(
      'SELECT player_id as id FROM sessions WHERE device_id = ? ORDER BY start_time DESC LIMIT 1'
    ).get(deviceId) as { id: string } | undefined;

    if (existing) {
      // Update nickname if changed
      db.prepare('UPDATE players SET nickname = ? WHERE id = ?').run(nickname, existing.id);
      return res.json({ playerId: existing.id });
    }

    // Create new player
    const playerId = uuidv4();
    db.prepare('INSERT INTO players (id, nickname) VALUES (?, ?)').run(playerId, nickname);

    res.json({ playerId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as playerRouter };
