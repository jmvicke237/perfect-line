import puzzlesData from './puzzles.json';
import dailyPuzzlesData from './dailyPuzzles.json';
import comparativePuzzlesData from './comparativePuzzles.json';
import singleSequencePuzzlesData from './singleSequencePuzzles.json';
import { Puzzle, Row, Item, ComparativePuzzle, SingleSequencePuzzle, SingleSequenceItem } from '../types/game';

interface PuzzleRowItem {
  id: string;
  name: string;
  value: number;
}

interface PuzzleRow {
  id: string;
  attribute: string;
  prompt: string;
  items: PuzzleRowItem[];
}

interface PuzzleDefinition {
  id: string;
  name: string;
  description: string;
  rows: PuzzleRow[];
}

interface DailyPuzzleDefinition {
  date: string;
  puzzleId: string;
  comparativePuzzleId?: string;
  name: string;
  description: string;
}

interface ComparativePuzzleDefinition {
  id: string;
  name: string;
  description: string;
  attribute: string;
  items: PuzzleRowItem[];
}

// Single Sequence Puzzle Utilities

interface SingleSequencePuzzleItem {
  shortText: string;
  longText?: string;
  displayValue: string | number;
}

interface SingleSequencePuzzleDefinition {
  id: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  items: SingleSequencePuzzleItem[];
  categories?: string[];
  difficulty?: string;
}

// Get all available puzzles
export const getPuzzles = (): PuzzleDefinition[] => {
  return puzzlesData.puzzles as PuzzleDefinition[];
};

// Get a specific puzzle by ID
export const getPuzzleById = (puzzleId: string): PuzzleDefinition | undefined => {
  return (puzzlesData.puzzles as PuzzleDefinition[]).find(puzzle => puzzle.id === puzzleId);
};

// Get all daily puzzles
export const getDailyPuzzles = (): DailyPuzzleDefinition[] => {
  return dailyPuzzlesData.dailyPuzzles;
};

// Get a daily puzzle for a specific date
export const getDailyPuzzleForDate = (dateString: string): DailyPuzzleDefinition | undefined => {
  return dailyPuzzlesData.dailyPuzzles.find(puzzle => puzzle.date === dateString);
};

// Get today's daily puzzle
export const getTodaysPuzzle = (): DailyPuzzleDefinition | undefined => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  return getDailyPuzzleForDate(dateString);
};

// Get the puzzle for today, or a specific date if provided
export const getDailyPuzzle = (dateString?: string): Puzzle | null => {
  // If no date is provided, use today's date
  const targetDate = dateString || new Date().toISOString().split('T')[0];
  
  // Find the daily puzzle definition for this date
  const dailyPuzzleDef = getDailyPuzzleForDate(targetDate);
  
  // If no puzzle is defined for this date, return a random puzzle
  if (!dailyPuzzleDef) {
    console.warn(`No puzzle defined for date ${targetDate}, returning a random puzzle instead.`);
    return createRandomPuzzle();
  }
  
  // Load the puzzle based on the ID in the daily puzzle definition
  const puzzle = createPlayablePuzzle(dailyPuzzleDef.puzzleId);
  
  if (!puzzle) {
    console.error(`Failed to load puzzle with ID ${dailyPuzzleDef.puzzleId} for date ${targetDate}`);
    return createRandomPuzzle();
  }
  
  return puzzle;
};

// Convert a puzzle definition into a playable puzzle
export const createPlayablePuzzle = (puzzleId: string): Puzzle | null => {
  const puzzleDef = getPuzzleById(puzzleId);
  if (!puzzleDef) return null;

  const rows: Row[] = puzzleDef.rows.map(rowDef => {
    const items: Item[] = rowDef.items.map((item: PuzzleRowItem) => {
      return {
        id: item.id,
        name: item.name,
        value: item.value
      };
    });

    // Determine the correct order based on values
    const correctOrder = [...items]
      .sort((a, b) => a.value - b.value)
      .map((item: Item) => item.id);

    return {
      id: rowDef.id,
      prompt: rowDef.prompt,
      attribute: rowDef.attribute,
      items,
      correctOrder
    };
  });

  return {
    id: puzzleDef.id,
    rows
  };
};

// Generate a random puzzle
export const createRandomPuzzle = (): Puzzle => {
  const puzzleIds = puzzlesData.puzzles.map(puzzle => puzzle.id);
  const randomIndex = Math.floor(Math.random() * puzzleIds.length);
  const randomPuzzleId = puzzleIds[randomIndex];
  const puzzle = createPlayablePuzzle(randomPuzzleId);
  
  if (!puzzle) {
    throw new Error('Failed to create random puzzle');
  }
  
  return puzzle;
};

// Get all comparative puzzles
export const getComparativePuzzles = (): ComparativePuzzleDefinition[] => {
  return comparativePuzzlesData.comparativePuzzles as ComparativePuzzleDefinition[];
};

// Get a specific comparative puzzle by ID
export const getComparativePuzzleById = (puzzleId: string): ComparativePuzzleDefinition | undefined => {
  return (comparativePuzzlesData.comparativePuzzles as ComparativePuzzleDefinition[]).find(puzzle => puzzle.id === puzzleId);
};

// Create a playable comparative puzzle from a comparative puzzle definition
export const createPlayableComparativePuzzle = (puzzleId: string): ComparativePuzzle | null => {
  const puzzleDef = getComparativePuzzleById(puzzleId);
  if (!puzzleDef) return null;

  return {
    id: puzzleDef.id,
    name: puzzleDef.name,
    description: puzzleDef.description,
    attribute: puzzleDef.attribute,
    items: puzzleDef.items.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value
    }))
  };
};

// Get the comparative puzzle for today, or a specific date if provided
export const getDailyComparativePuzzle = (dateString?: string): ComparativePuzzle | null => {
  // If no date is provided, use today's date
  const targetDate = dateString || new Date().toISOString().split('T')[0];
  
  // Find the daily puzzle definition for this date
  const dailyPuzzleDef = getDailyPuzzleForDate(targetDate);
  
  // If no puzzle is defined for this date, return null
  if (!dailyPuzzleDef || !dailyPuzzleDef.comparativePuzzleId) {
    console.warn(`No comparative puzzle defined for date ${targetDate}`);
    return null;
  }
  
  // Load the puzzle based on the ID in the daily puzzle definition
  const puzzle = createPlayableComparativePuzzle(dailyPuzzleDef.comparativePuzzleId);
  
  if (!puzzle) {
    console.error(`Failed to load comparative puzzle with ID ${dailyPuzzleDef.comparativePuzzleId} for date ${targetDate}`);
    return null;
  }
  
  return puzzle;
};

// Get all single sequence puzzles
export const getSingleSequencePuzzles = (): SingleSequencePuzzleDefinition[] => {
  return singleSequencePuzzlesData.content as SingleSequencePuzzleDefinition[];
};

// Get a specific single sequence puzzle by ID
export const getSingleSequencePuzzleById = (puzzleId: string): SingleSequencePuzzleDefinition | undefined => {
  return (singleSequencePuzzlesData.content as SingleSequencePuzzleDefinition[]).find(puzzle => puzzle.id === puzzleId);
};

// Create a playable single sequence puzzle
export const createPlayableSingleSequencePuzzle = (puzzleId: string): SingleSequencePuzzle | null => {
  const puzzleDef = getSingleSequencePuzzleById(puzzleId);
  if (!puzzleDef) return null;

  // Create items with unique IDs
  const items: SingleSequenceItem[] = puzzleDef.items.map((item, index) => {
    return {
      id: `item-${index}`,
      shortText: item.shortText,
      longText: item.longText,
      displayValue: item.displayValue
    };
  });

  return {
    id: puzzleDef.id,
    prompt: puzzleDef.prompt,
    leftLabel: puzzleDef.leftLabel,
    rightLabel: puzzleDef.rightLabel,
    items,
    categories: puzzleDef.categories,
    difficulty: puzzleDef.difficulty
  };
};

// Get a random single sequence puzzle
export const getRandomSingleSequencePuzzle = (): SingleSequencePuzzle | null => {
  const puzzles = getSingleSequencePuzzles();
  if (puzzles.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * puzzles.length);
  const randomPuzzleId = puzzles[randomIndex].id;
  
  return createPlayableSingleSequencePuzzle(randomPuzzleId);
}; 