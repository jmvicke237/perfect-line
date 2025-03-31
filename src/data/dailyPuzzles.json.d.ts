declare module './dailyPuzzles.json' {
  interface DailyPuzzleDefinition {
    date: string;
    puzzleId: string;
    comparativePuzzleId?: string;
    name: string;
    description: string;
  }

  interface DailyPuzzlesData {
    dailyPuzzles: DailyPuzzleDefinition[];
  }

  const data: DailyPuzzlesData;
  export default data;
} 