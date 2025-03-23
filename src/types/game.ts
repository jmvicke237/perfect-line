export interface Item {
  id: string;
  name: string;
  value: number;
}

export interface Row {
  id: string;
  prompt: string;
  items: Item[];
  correctOrder: string[];
}

export interface Puzzle {
  id: string;
  rows: Row[];
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  userOrder: Record<string, string[]>;
  isSubmitted: boolean;
  results: Record<string, boolean[]>;
} 