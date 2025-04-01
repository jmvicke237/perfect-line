# Perfect Line - Game Data Structure

The `dailyContent.json` file contains all puzzles for the game organized by date.
Each entry in the "dailyContent" array represents content for a specific date
and may include different types of puzzles:

- **comparative**: Higher/Lower comparison puzzle
- **sequence**: Single sequence ordering puzzle
- **survey**: Daily survey question

Each date can have any combination of these puzzle types.

## Structure of dailyContent.json

Each entry in the `dailyContent` array has:
- `date`: The date in YYYY-MM-DD format
- `name`: A display name for the date
- Optional puzzle types: `comparative`, `sequence`, `survey`

## How the Survey System Works

The survey system operates in a two-day cycle:

1. **Day 1**: Users answer today's question, and their responses are stored
2. **Day 2**: Users can see the responses from yesterday's question and play the ordering game, while also answering today's new question

This creates a continuous cycle where users always have both a question to answer and yesterday's results to order.

## File Structure

- `dailyContent.json` - Main data file containing all puzzles
- `gameDataUtils.ts` - Utility functions to retrieve and manage game data 