export interface Item {
  id: string;
  name: string;
  value: number;
}

export interface Row {
  id: string;
  prompt: string;
  attribute?: string;
  color?: string;
  items: Item[];
  correctOrder: string[];
}

export interface Puzzle {
  id: string;
  rows: Row[];
}

export interface ComparativePuzzle {
  id: string;
  name: string;
  description: string;
  attribute: string;
  items: Item[];
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  userOrder: Record<string, string[]>;
  isSubmitted: boolean;
  results: Record<string, boolean[]>;
} 