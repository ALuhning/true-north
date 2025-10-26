export interface ScoreCalculation {
  base: number;
  timeBonus: number;
  streakBonus: number;
  total: number;
}

export function calculateScore(
  correct: boolean,
  latencyMs: number,
  streak: number
): ScoreCalculation {
  if (!correct) {
    return { base: 0, timeBonus: 0, streakBonus: 0, total: 0 };
  }

  const base = 100;
  
  // Time bonus: linear decay from 50 to 0 over 6 seconds (6000ms)
  const timeBonus = Math.max(0, Math.floor(50 * (1 - latencyMs / 6000)));
  
  // Streak bonus: +10 per consecutive correct, capped at +50
  const streakBonus = Math.min(50, streak * 10);
  
  const total = base + timeBonus + streakBonus;
  
  return { base, timeBonus, streakBonus, total };
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${seconds}s`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}
