import { create } from 'zustand';
import { Question, SubmitAnswerResponse } from './lib/api';

interface GameState {
  playerId: string | null;
  sessionId: string | null;
  deck: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  answers: SubmitAnswerResponse[];
  sessionStartTime: number | null;
  
  setPlayerId: (id: string) => void;
  setSession: (sessionId: string, deck: Question[]) => void;
  recordAnswer: (answer: SubmitAnswerResponse) => void;
  nextQuestion: () => void;
  reset: () => void;
  isComplete: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerId: null,
  sessionId: null,
  deck: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  answers: [],
  sessionStartTime: null,

  setPlayerId: (id) => set({ playerId: id }),

  setSession: (sessionId, deck) => 
    set({
      sessionId,
      deck,
      currentIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      sessionStartTime: Date.now()
    }),

  recordAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
      score: answer.runningScore,
      streak: answer.streak
    })),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1
    })),

  reset: () =>
    set({
      sessionId: null,
      deck: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      sessionStartTime: null
    }),

  isComplete: () => {
    const state = get();
    return state.currentIndex >= state.deck.length;
  }
}));
