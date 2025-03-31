declare module './singleSequencePuzzles.json' {
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

  interface SingleSequencePuzzleData {
    content: SingleSequencePuzzleDefinition[];
  }

  const data: SingleSequencePuzzleData;
  export default data;
} 