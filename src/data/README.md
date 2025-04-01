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

## ID Formatting Rules & Recommendations

Several parts of the JSON structure require unique IDs. While there are few strict technical rules beyond being unique strings, follow these recommendations:

1.  **Top-Level Puzzle IDs (`comparative.id`, `sequence.id`):**
    *   **Uniqueness:** Must be unique across the *entire* `dailyContent.json` file.
    *   **Formatting:** Use descriptive `kebab-case` (e.g., `comp-countries-gdp`) or `snake_case`. Avoid spaces and special characters.

2.  **Comparative Item IDs (`comparative.items[].id`):**
    *   **Uniqueness:** Must be unique *within the items list of that specific comparative puzzle*.
    *   **Formatting:** Use descriptive `kebab-case` (e.g., `spider-man-no-way-home`) or `snake_case`. Avoid spaces and special characters.

3.  **Sequence Item IDs:**
    *   These are **auto-generated** by the code (`item-0`, `item-1`, etc.). **Do not** add manual IDs for sequence items in the JSON.

4.  **Survey IDs (`survey.id`):**
    *   **Uniqueness:** Must be unique across the *entire* `dailyContent.json` file, as these are used as part of the key for storing results in Firebase/localStorage.
    *   **Formatting:** Simple IDs like `q1`, `q2` are fine. Keep them short and unique.

## How the Survey System Works

The survey system operates in a two-day cycle:

1. **Day 1**: Users answer today's question, and their responses are stored
2. **Day 2**: Users can see the responses from yesterday's question and play the ordering game, while also answering today's new question

This creates a continuous cycle where users always have both a question to answer and yesterday's results to order.

## File Structure

- `dailyContent.json` - Main data file containing all puzzles
- `gameDataUtils.ts` - Utility functions to retrieve and manage game data 