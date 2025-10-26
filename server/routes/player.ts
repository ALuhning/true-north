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
      // Update nickname if changed (with disambiguation)
      const uniqueNickname = makeNicknameUnique(nickname, existing.id);
      db.prepare('UPDATE players SET nickname = ? WHERE id = ?').run(uniqueNickname, existing.id);
      return res.json({ playerId: existing.id, nickname: uniqueNickname });
    }

    // Create new player with unique nickname
    const playerId = uuidv4();
    const uniqueNickname = makeNicknameUnique(nickname);
    db.prepare('INSERT INTO players (id, nickname) VALUES (?, ?)').run(playerId, uniqueNickname);

    res.json({ playerId, nickname: uniqueNickname });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Make nickname unique by appending a number if it already exists
 * @param nickname - Desired nickname
 * @param excludePlayerId - Player ID to exclude from duplicate check (for updates)
 */
function makeNicknameUnique(nickname: string, excludePlayerId?: string): string {
  const baseNickname = nickname.trim();
  
  // Check if exact nickname exists
  let query = 'SELECT COUNT(*) as count FROM players WHERE nickname = ?';
  let params: any[] = [baseNickname];
  
  if (excludePlayerId) {
    query += ' AND id != ?';
    params.push(excludePlayerId);
  }
  
  const exactMatch = db.prepare(query).get(...params) as { count: number };
  
  if (exactMatch.count === 0) {
    return baseNickname;
  }
  
  // Find the highest number suffix
  let suffixQuery = `SELECT nickname FROM players WHERE nickname LIKE ?`;
  let suffixParams: any[] = [`${baseNickname}%`];
  
  if (excludePlayerId) {
    suffixQuery += ' AND id != ?';
    suffixParams.push(excludePlayerId);
  }
  
  const similar = db.prepare(suffixQuery).all(...suffixParams) as { nickname: string }[];
  
  let maxNumber = 0;
  const pattern = new RegExp(`^${baseNickname}(\\d+)$`);
  
  for (const row of similar) {
    const match = row.nickname.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  
  // Return nickname with next available number
  return `${baseNickname}${maxNumber + 1}`;
}

export { router as playerRouter };
