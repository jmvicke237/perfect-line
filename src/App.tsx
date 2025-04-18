import { useState, useEffect } from 'react';
import { getDailyComparativePuzzle, getDailySequencePuzzle, getCurrentSurveyQuestion } from './data/gameDataUtils';
import { ComparativePuzzle, SingleSequencePuzzle } from './types/game';
import ComparativeGame from './components/ComparativeGame';
import SingleSequenceGame from './components/SingleSequenceGame';
import SurveyGame from './components/SurveyGame';

// Define game modes
type GameMode = 'comparative' | 'sequence' | 'survey';

function App() {
  // State for puzzle date and game mode
  const [puzzleDate, setPuzzleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [gameMode, setGameMode] = useState<GameMode>('survey'); // Default to survey mode
  const [showModeSelect, setShowModeSelect] = useState<boolean>(true);
  
  // For comparative game mode
  const [comparativePuzzle, setComparativePuzzle] = useState<ComparativePuzzle | null>(null);
  
  // For sequence game mode
  const [sequencePuzzle, setSequencePuzzle] = useState<SingleSequencePuzzle | null>(null);
  
  // Load puzzle on initial render
  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  // Load puzzle when date changes
  useEffect(() => {
    loadDailyPuzzle();
  }, [puzzleDate]);

  // Load puzzles for the selected date
  const loadDailyPuzzle = () => {
    // Load comparative puzzle for the selected date
    const newComparativePuzzle = getDailyComparativePuzzle(puzzleDate);
    setComparativePuzzle(newComparativePuzzle);
    
    // Load a sequence puzzle for the selected date
    const newSequencePuzzle = getDailySequencePuzzle(puzzleDate);
    setSequencePuzzle(newSequencePuzzle);
    
    // Reset to show mode selection when loading a new puzzle
    setShowModeSelect(true);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPuzzleDate(event.target.value);
  };

  const selectGameMode = (mode: GameMode) => {
    setGameMode(mode);
    setShowModeSelect(false);
  };

  // Mode selection screen
  const renderModeSelection = () => (
    <div className="w-full max-w-lg mx-auto bg-indigo-900 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Select Game Mode</h2>
      <div className="flex flex-col gap-4">
        {/* Always show the comparative mode, but disable if there's no puzzle for it */}
        <button
          onClick={() => comparativePuzzle && selectGameMode('comparative')}
          className={`p-4 ${comparativePuzzle ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-900 opacity-60 cursor-not-allowed'} rounded-lg`}
        >
          <h3 className="text-xl font-bold mb-2">Higher or Lower</h3>
          <p className="text-sm opacity-80">
            {comparativePuzzle 
              ? "Compare pairs of items and choose the one with the higher value. The winner stays for the next round!"
              : "No Higher or Lower challenge available for this date."}
          </p>
        </button>
        
        {sequencePuzzle && (
          <button
            onClick={() => selectGameMode('sequence')}
            className="p-4 bg-indigo-700 hover:bg-indigo-600 rounded-lg"
          >
            <h3 className="text-xl font-bold mb-2">Sequence Mode</h3>
            <p className="text-sm opacity-80">
              Arrange items in the correct sequence from lowest to highest value
            </p>
          </button>
        )}

        <button
          onClick={() => selectGameMode('survey')}
          className="p-4 bg-indigo-700 hover:bg-indigo-600 rounded-lg"
        >
          <h3 className="text-xl font-bold mb-2">Daily Survey</h3>
          <p className="text-sm opacity-80">
            Answer today's numerical question and order yesterday's results!
          </p>
        </button>
      </div>
    </div>
  );

  return (
    <div 
      style={{ backgroundColor: '#1e1b4b', color: 'white', minHeight: '100vh', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <header 
        style={{ width: '100%', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <h1 
          style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem', textAlign: 'center' }}
        >
          Perfect Line
        </h1>
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          <input 
            type="date" 
            value={puzzleDate} 
            onChange={handleDateChange}
            className="bg-indigo-700 text-white p-1 md:p-2 rounded text-sm md:text-base"
          />
          <div className="relative">
            <button
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center space-x-1"
              onClick={() => setPuzzleDate(new Date().toISOString().split('T')[0])}
            >
              <span>Today</span>
            </button>
          </div>
          {!showModeSelect && (
            <button
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md"
              onClick={() => setShowModeSelect(true)}
            >
              Change Mode
            </button>
          )}
        </div>
      </header>

      {showModeSelect ? (
        renderModeSelection()
      ) : gameMode === 'comparative' && comparativePuzzle ? (
        <ComparativeGame 
          items={comparativePuzzle.items}
          maxRounds={6}
          title={comparativePuzzle.name}
          description={`Select the item with the HIGHER ${comparativePuzzle.attribute}`}
          attribute={comparativePuzzle.attribute}
        />
      ) : gameMode === 'sequence' && sequencePuzzle ? (
        <SingleSequenceGame puzzle={sequencePuzzle} />
      ) : gameMode === 'survey' ? (
        <SurveyGame />
      ) : (
        <div className="w-full max-w-lg mx-auto text-center p-6 bg-indigo-800 rounded-lg">
          <h3 className="text-xl font-bold mb-4">No Puzzle Available</h3>
          <p className="mb-4">There is no puzzle available for the selected mode and date.</p>
          <button
            onClick={() => setShowModeSelect(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium"
          >
            Choose Another Mode
          </button>
        </div>
      )}

      {/* Debug info - only displayed during development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-xs max-w-lg">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <div>Game Mode: {gameMode}</div>
          <div>Comparative Puzzle: {comparativePuzzle ? 'Available' : 'Not Available'}</div>
          <div>Sequence Puzzle: {sequencePuzzle ? 'Available' : 'Not Available'}</div>
        </div>
      )}
    </div>
  );
}

export default App;
