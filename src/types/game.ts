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

export interface SingleSequenceItem {
  id: string;
  shortText: string;
  longText?: string;
  displayValue: string | number;
}

export interface SingleSequencePuzzle {
  id: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  items: SingleSequenceItem[];
  categories?: string[];
  difficulty?: string;
}

export interface SingleSequenceGameState {
  currentPuzzle: SingleSequencePuzzle | null;
  userOrder: string[];
  isSubmitted: boolean;
  results: boolean[];
}

export interface GameState {
  currentPuzzle: Puzzle | null;
  userOrder: Record<string, string[]>;
  isSubmitted: boolean;
  results: Record<string, boolean[]>;
}

export interface SurveyQuestion {
  id: string;
  date: string;
  question: string;
  unit?: string;
}

export interface SurveyResponse {
  questionId: string;
  date: string;
  name: string;
  answer: number;
  timestamp: string;
}

export interface SurveyResult {
  question: SurveyQuestion;
  responses: SurveyResponse[];
} 