declare module './comparativePuzzles.json' {
  interface ComparativePuzzleItem {
    id: string;
    name: string;
    value: number;
  }

  interface ComparativePuzzleDefinition {
    id: string;
    name: string;
    description: string;
    attribute: string;
    items: ComparativePuzzleItem[];
  }

  interface ComparativePuzzlesData {
    comparativePuzzles: ComparativePuzzleDefinition[];
  }

  const data: ComparativePuzzlesData;
  export default data;
} 