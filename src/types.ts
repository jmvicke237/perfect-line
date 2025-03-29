export interface Item {
  id: string;
  name: string;
  value?: number;
}

export interface Puzzle {
  id: string;
  date: string;
  prompt: string;
  items: Item[];
  correctOrder: string[];
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  isSubmitted: boolean;
  correctPositions: boolean[];
  score: number;
  streak: number;
  bestStreak: number;
} 