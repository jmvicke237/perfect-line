declare module './puzzles.json' {
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

  interface PuzzlesData {
    puzzles: PuzzleDefinition[];
  }

  const data: PuzzlesData;
  export default data;
} 