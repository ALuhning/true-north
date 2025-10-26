const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3002') + '/api';

export interface CreatePlayerRequest {
  nickname: string;
  deviceId: string;
}

export interface CreatePlayerResponse {
  playerId: string;
  nickname: string;
}

export interface StartSessionRequest {
  playerId: string;
  deviceId: string;
}

export interface Question {
  id: string;
  prompt: string;
  imageUrl: string | null;
  orderIndex: number;
}

export interface StartSessionResponse {
  sessionId: string;
  deck: Question[];
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  latencyMs: number;
  guess: 'CAN' | 'USA';
}

export interface SubmitAnswerResponse {
  correct: boolean;
  correctAnswer: 'CAN' | 'USA';
  explanation: string;
  pointsAwarded: number;
  streak: number;
  runningScore: number;
}

export interface FinishSessionRequest {
  sessionId: string;
}

export interface FinishSessionResponse {
  score: number;
  durationMs: number;
  rank: number;
  shareText: string;
}

export interface LeaderboardEntry {
  nickname: string;
  score: number;
  duration_ms: number;
  rank: number;
  session_id: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  period: string;
}

class ApiClient {
  async createPlayer(req: CreatePlayerRequest): Promise<CreatePlayerResponse> {
    const response = await fetch(`${API_BASE}/player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      throw new Error('Failed to create player');
    }

    return response.json();
  }

  async startSession(req: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Session start failed:', error);
      throw new Error(error.error || 'Failed to start session');
    }

    return response.json();
  }

  async submitAnswer(req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    const response = await fetch(`${API_BASE}/session/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }

    return response.json();
  }

  async finishSession(req: FinishSessionRequest): Promise<FinishSessionResponse> {
    const response = await fetch(`${API_BASE}/session/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Session finish failed:', error);
      throw new Error(error.error || 'Failed to finish session');
    }

    return response.json();
  }

  async getLeaderboard(period: 'today' | 'all' = 'today'): Promise<LeaderboardResponse> {
    const response = await fetch(`${API_BASE}/leaderboard?period=${period}`);

    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
  }

  async adminAction(code: string, action: string, questionId?: string, sessionId?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/admin/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, action, questionId, sessionId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Admin action failed');
    }

    return response.json();
  }

  async getAdminLeaderboard(code: string): Promise<{ entries: Array<{
    session_id: string;
    date: string;
    nickname: string;
    score: number;
    duration_ms: number;
    rank: number;
    start_time: number;
  }> }> {
    const response = await fetch(`${API_BASE}/admin/leaderboard?code=${encodeURIComponent(code)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch admin leaderboard');
    }

    return response.json();
  }

  async getAdminQuestions(code: string): Promise<{ questions: Array<{
    id: string;
    prompt: string;
    answer: 'CAN' | 'USA';
    explanation: string;
    tags: string;
    image_url: string | null;
    active: number;
  }> }> {
    const response = await fetch(`${API_BASE}/admin/questions?code=${encodeURIComponent(code)}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch questions');
    }

    return response.json();
  }

  async createQuestion(code: string, data: {
    prompt: string;
    answer: 'CAN' | 'USA';
    explanation: string;
    tags?: string;
    image_url?: string;
  }): Promise<{ success: boolean; message: string; id: string }> {
    const response = await fetch(`${API_BASE}/admin/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create question');
    }

    return response.json();
  }

  async updateQuestion(code: string, id: string, data: {
    prompt: string;
    answer: 'CAN' | 'USA';
    explanation: string;
    tags?: string;
    image_url?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/admin/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, ...data })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update question');
    }

    return response.json();
  }

  async deleteQuestion(code: string, id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE}/admin/questions/${id}?code=${encodeURIComponent(code)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete question');
    }

    return response.json();
  }
}

export const api = new ApiClient();
