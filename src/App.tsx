import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getDailyPuzzle, getDailyPuzzleForDate } from './data/gameDataUtils';
import { Puzzle, Item } from './types/game';

// Sortable Item Component
const SortableItem = ({ id, name, category, isCorrect, isWrong }: { 
  id: string; 
  name: string; 
  category?: string; 
  isCorrect?: boolean;
  isWrong?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
  };

  // Determine color based on whether it's correct or not
  let backgroundColor = '#2a2a34'; // default dark gray
  let textColor = '#fff';
  let borderColor = 'transparent';
  
  if (isCorrect) {
    backgroundColor = '#4ade80'; // green for correct
    textColor = '#fff';
    borderColor = '#2e8555';
  } else if (isWrong) {
    backgroundColor = '#f87171'; // red for wrong
    textColor = '#fff';
    borderColor = '#b91c1c';
  } else if (isDragging) {
    backgroundColor = '#4b4b58'; // slightly lighter when dragging
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        aspectRatio: '1/1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
        borderRadius: '4px',
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor,
        color: textColor,
        border: `2px solid ${borderColor}`,
        transition: transition || 'all 0.2s ease',
        userSelect: 'none',
        boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.3)' : 'none',
        padding: '4px',
        textAlign: 'center',
      }}
      {...attributes}
      {...listeners}
    >
      {name}
    </div>
  );
};

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
        distance: 8, // Start dragging after moving 8px
      },
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

  const goToToday = () => {
    setPuzzleDate(new Date().toISOString().split('T')[0]);
  };

  // Get correct position info for an item
  const getItemPositionInfo = (item: Item, index: number, rowId: string): { isCorrect: boolean; isWrong: boolean } => {
    if (!isSubmitted) {
      return { isCorrect: false, isWrong: false };
    }
    
    const positionResults = correctPositions[rowId];
    if (!positionResults) {
      return { isCorrect: false, isWrong: false };
    }
    
    const isCorrect = positionResults[index];
    
    return {
      isCorrect,
      isWrong: !isCorrect
    };
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
    puzzle.rows.forEach((row, rowIndex) => {
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

  if (!puzzle) return <div>Loading...</div>;

  return (
    <div style={{
      backgroundColor: '#121213', 
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '5px'
        }}>
          PERFECT LINE
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#4a95f9',
          marginBottom: '5px'
        }}>
          {puzzleTitle}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#aaa',
          marginBottom: '10px'
        }}>
          {puzzleDescription || 'Arrange items in order from lowest to highest value'}
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label htmlFor="date-picker" style={{ fontSize: '14px' }}>Date:</label>
            <input 
              id="date-picker"
              type="date" 
              value={puzzleDate}
              onChange={handleDateChange}
              style={{
                backgroundColor: '#2a2a34',
                color: 'white',
                border: '1px solid #4a4a4a',
                padding: '6px',
                borderRadius: '4px'
              }}
            />
            <button
              onClick={goToToday}
              style={{
                backgroundColor: '#2a2a34',
                color: 'white',
                border: '1px solid #4a4a4a',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          width: '100%',
          maxWidth: '580px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {puzzle.rows.map((row) => {
            const rowItems = itemsByRow[row.id] || [];
            
            return (
              <div key={row.id} style={{
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                }}>
                  {row.prompt}
                </div>
                <SortableContext items={rowItems.map(item => item.id)}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '10px'
                  }}>
                    {rowItems.map((item, index) => {
                      const { isCorrect, isWrong } = getItemPositionInfo(item, index, row.id);
                      
                      return (
                        <SortableItem 
                          key={item.id} 
                          id={item.id} 
                          name={item.name} 
                          isCorrect={isCorrect}
                          isWrong={isWrong}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>

      <div className="mt-4 flex justify-center gap-3">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitted && gameComplete}
          className={`px-4 py-2 rounded font-medium ${
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium text-white"
          >
            Reset
          </button>
        )}
        
        {isSubmitted && (
          <button 
            onClick={handleShare}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-medium text-white"
          >
            Share
          </button>
        )}
      </div>
      
      {isSubmitted && (
        <div className="mt-4 text-center">
          <p>Score: {score[0]}/{score[1]}</p>
        </div>
      )}
    </div>
  );
}

export default App;
