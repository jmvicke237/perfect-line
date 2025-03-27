import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent, useSensors, useSensor, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { getDailyPuzzle, getDailyPuzzleForDate } from './data/gameDataUtils';
import { Puzzle, Item } from './types/game';
import GameRow from './components/GameRow';
import { CalendarIcon } from '@heroicons/react/24/outline';

function App() {
  // State for puzzle date
  const [puzzleDate, setPuzzleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [puzzleTitle, setPuzzleTitle] = useState<string>('Today\'s Puzzle');
  const [puzzleDescription, setPuzzleDescription] = useState<string>('');
  
  // Initialize puzzle state
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [itemsByRow, setItemsByRow] = useState<Record<string, Item[]>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [correctPositions, setCorrectPositions] = useState<Record<string, boolean[]>>({});
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduce the activation distance for mobile
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Small delay for better touch handling
        tolerance: 5, // Tolerance for small movements
      }
    })
  );

  // Load puzzle on initial render
  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  // Load puzzle when date changes
  useEffect(() => {
    loadDailyPuzzle();
  }, [puzzleDate]);

  // Load puzzle for the selected date
  const loadDailyPuzzle = () => {
    // Load the daily puzzle for the selected date
    const newPuzzle = getDailyPuzzle(puzzleDate);
    
    // Update title and description
    const dailyPuzzleInfo = getDailyPuzzleForDate(puzzleDate);
    if (dailyPuzzleInfo) {
      setPuzzleTitle(dailyPuzzleInfo.name);
      setPuzzleDescription(dailyPuzzleInfo.description);
    } else {
      setPuzzleTitle('Daily Puzzle');
      setPuzzleDescription('A randomly selected puzzle for today');
    }
    
    if (newPuzzle) {
      setPuzzle(newPuzzle);
      
      // Initialize items by row from new puzzle
      const initialItems: Record<string, Item[]> = {};
      newPuzzle.rows.forEach(row => {
        // Shuffle the items for each row
        initialItems[row.id] = [...row.items].sort(() => Math.random() - 0.5);
      });
      
      setItemsByRow(initialItems);
      setIsSubmitted(false);
      setCorrectPositions({});
      setGameComplete(false);
      setScore([0, 0]);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || isSubmitted || !puzzle) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find which row these items belong to
    let activeRowId: string | null = null;
    let overRowId: string | null = null;
    
    for (const row of puzzle.rows) {
      if (row.items.some(item => item.id === activeId)) {
        activeRowId = row.id;
      }
      if (row.items.some(item => item.id === overId)) {
        overRowId = row.id;
      }
    }
    
    // Only allow reordering within the same row
    if (activeRowId !== overRowId || !activeRowId) return;
    
    const rowItems = [...itemsByRow[activeRowId]];
    const oldIndex = rowItems.findIndex(item => item.id === activeId);
    const newIndex = rowItems.findIndex(item => item.id === overId);
    
    if (oldIndex === newIndex) return;

    // Reorder the items within the row
    const newRowItems = arrayMove(rowItems, oldIndex, newIndex);
    
    // Update the state
    setItemsByRow({
      ...itemsByRow,
      [activeRowId]: newRowItems
    });
  };

  const handleSubmit = () => {
    if (!puzzle) return;
    
    // Calculate results for each row
    const newCorrectPositions: Record<string, boolean[]> = {};
    let totalCorrect = 0;
    let totalItems = 0;
    
    puzzle.rows.forEach(row => {
      const rowItems = itemsByRow[row.id];
      if (!rowItems) return;
      
      // Compare current order with correct order
      const rowResults = rowItems.map((item, index) => {
        const correctIndex = row.correctOrder.findIndex(id => id === item.id);
        const isCorrect = correctIndex === index;
        if (isCorrect) totalCorrect++;
        totalItems++;
        return isCorrect;
      });
      
      newCorrectPositions[row.id] = rowResults;
    });
    
    setCorrectPositions(newCorrectPositions);
    setIsSubmitted(true);
    setScore([totalCorrect, totalItems]);
    setGameComplete(totalCorrect === totalItems);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPuzzleDate(event.target.value);
  };
  
  const resetGame = () => {
    loadDailyPuzzle();
  };

  // Generate a shareable result with emoji squares
  const generateShareableResult = () => {
    if (!isSubmitted || !puzzle) return '';
    
    const dateStr = puzzleDate || new Date().toISOString().split('T')[0];
    // Create date object with timezone handling to avoid off-by-one errors
    const dateObj = new Date(dateStr + 'T12:00:00'); // Add noon time to avoid timezone issues
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    let shareText = `Perfect Line - ${formattedDate}\n\n`;
    
    // Add emoji grid for each row
    puzzle.rows.forEach(row => {
      const rowResults = correctPositions[row.id] || [];
      rowResults.forEach(isCorrect => {
        shareText += isCorrect ? '🟩' : '🟥';
      });
      shareText += '\n';
    });
    
    // Add score
    shareText += `\n${score[0]}/${score[1]} correct`;
    
    return shareText;
  };
  
  const handleShare = async () => {
    const shareText = generateShareableResult();
    
    if (navigator.share && navigator.canShare?.({ text: shareText })) {
      try {
        await navigator.share({
          title: 'Perfect Line Results',
          text: shareText
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to clipboard if sharing fails
        copyToClipboard(shareText);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      copyToClipboard(shareText);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Results copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy results:', err);
        alert('Failed to copy results. Please try again.');
      });
  };

  const [showDatePicker, setShowDatePicker] = useState(false);

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
        <div className="mb-2 md:mb-4 flex flex-wrap justify-center gap-2">
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
        </div>
        <div className="text-center mb-2 md:mb-4">
          <h2 className="text-lg md:text-xl font-semibold">{puzzleTitle}</h2>
          <p className="text-xs md:text-sm opacity-80">{puzzleDescription}</p>
        </div>
      </header>

      {puzzle && (
        <div className="w-full max-w-lg">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {puzzle.rows.map((row) => (
              <SortableContext key={row.id} items={itemsByRow[row.id]?.map(item => item.id) || []}>
                <GameRow 
                  rowId={row.id}
                  prompt={row.prompt}
                  items={itemsByRow[row.id] || []}
                  isSubmitted={isSubmitted}
                  correctPositions={correctPositions[row.id]}
                />
              </SortableContext>
            ))}
          </DndContext>

          <div className="mt-4 flex justify-center gap-2 md:gap-3 flex-wrap">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitted && gameComplete}
              className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                isSubmitted && gameComplete 
                  ? 'bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSubmitted ? (gameComplete ? '🎉 Perfect!' : 'Try Again') : 'Submit'}
            </button>
            
            {isSubmitted && (
              <button 
                onClick={resetGame}
                className="px-3 py-1 md:px-4 md:py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium text-white text-sm md:text-base"
              >
                Reset
              </button>
            )}
            
            {isSubmitted && (
              <button 
                onClick={handleShare}
                className="px-3 py-1 md:px-4 md:py-2 bg-green-600 hover:bg-green-500 rounded font-medium text-white text-sm md:text-base"
              >
                Share
              </button>
            )}
          </div>
          
          {isSubmitted && (
            <div className="mt-4 text-center">
              <p className="text-sm md:text-base">Score: {score[0]}/{score[1]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
