import { Puzzle } from '../types/game';

export const samplePuzzle: Puzzle = {
  id: 'sample-1',
  rows: [
    {
      id: 'row-1',
      prompt: 'Sort these brands by Instagram followers (least to most)',
      items: [
        { id: 'brand-1', name: 'Patagonia', value: 5000000 },
        { id: 'brand-2', name: 'Nike', value: 30000000 },
        { id: 'brand-3', name: 'Adidas', value: 25000000 },
        { id: 'brand-4', name: 'Puma', value: 15000000 },
        { id: 'brand-5', name: 'Under Armour', value: 20000000 },
      ],
      correctOrder: ['brand-1', 'brand-4', 'brand-5', 'brand-3', 'brand-2'],
    },
    {
      id: 'row-2',
      prompt: 'Sort these cities by population (smallest to largest)',
      items: [
        { id: 'city-1', name: 'San Francisco', value: 873965 },
        { id: 'city-2', name: 'New York', value: 8804190 },
        { id: 'city-3', name: 'Los Angeles', value: 3898747 },
        { id: 'city-4', name: 'Chicago', value: 2746388 },
        { id: 'city-5', name: 'Houston', value: 2304580 },
      ],
      correctOrder: ['city-1', 'city-5', 'city-4', 'city-3', 'city-2'],
    },
    {
      id: 'row-3',
      prompt: 'Sort these movies by box office revenue (lowest to highest)',
      items: [
        { id: 'movie-1', name: 'The Shawshank Redemption', value: 73000000 },
        { id: 'movie-2', name: 'Avatar', value: 2923706025 },
        { id: 'movie-3', name: 'Titanic', value: 2264000000 },
        { id: 'movie-4', name: 'Star Wars: Episode VII', value: 2068223624 },
        { id: 'movie-5', name: 'Avengers: Endgame', value: 2797800564 },
      ],
      correctOrder: ['movie-1', 'movie-4', 'movie-3', 'movie-5', 'movie-2'],
    },
    {
      id: 'row-4',
      prompt: 'Sort these companies by market cap (smallest to largest)',
      items: [
        { id: 'company-1', name: 'Tesla', value: 500000000000 },
        { id: 'company-2', name: 'Apple', value: 3000000000000 },
        { id: 'company-3', name: 'Microsoft', value: 2500000000000 },
        { id: 'company-4', name: 'Amazon', value: 1500000000000 },
        { id: 'company-5', name: 'Google', value: 2000000000000 },
      ],
      correctOrder: ['company-1', 'company-4', 'company-5', 'company-3', 'company-2'],
    },
  ],
}; 