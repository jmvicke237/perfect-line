import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import GameRow from './GameRow';
import { GameState, Puzzle } from '../types/game';

interface GameProps {
  puzzle: Puzzle;
}

export const Game = ({ puzzle }: GameProps) => {
  const [gameState, setGameState] = useState<GameState>({
    currentPuzzle: puzzle,
    userOrder: {},
    isSubmitted: false,
    results: {},
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !gameState.currentPuzzle) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeRow = activeId.split('-')[0];
    const row = gameState.currentPuzzle.rows.find(r => r.id === activeRow);
    if (!row) return;

    const oldIndex = row.items.findIndex(item => item.id === activeId);
    const newIndex = row.items.findIndex(item => item.id === overId);
    
    if (oldIndex === newIndex) return;

    const updatedPuzzle: Puzzle = {
      ...gameState.currentPuzzle,
      rows: gameState.currentPuzzle.rows.map(r => {
        if (r.id === activeRow) {
          return {
            ...r,
            items: arrayMove(r.items, oldIndex, newIndex),
          };
        }
        return r;
      }),
    };

    setGameState(prev => ({
      ...prev,
      currentPuzzle: updatedPuzzle,
      userOrder: {
        ...prev.userOrder,
        [activeRow]: updatedPuzzle.rows.find(r => r.id === activeRow)?.items.map(item => item.id) || [],
      },
    }));
  };

  const handleSubmit = () => {
    if (!gameState.currentPuzzle) return;

    const results: Record<string, boolean[]> = {};
    gameState.currentPuzzle.rows.forEach(row => {
      const userOrder = gameState.userOrder[row.id] || row.items.map(item => item.id);
      results[row.id] = userOrder.map((id, index) => id === row.correctOrder[index]);
    });

    setGameState(prev => ({
      ...prev,
      isSubmitted: true,
      results,
    }));
  };

  const calculateScore = (): [number, number] => {
    if (!gameState.isSubmitted || !gameState.currentPuzzle) return [0, 0];
    
    let correct = 0;
    let total = 0;
    
    Object.values(gameState.results).forEach(rowResults => {
      rowResults.forEach(result => {
        if (result) correct++;
        total++;
      });
    });
    
    return [correct, total];
  };

  const generateShareText = () => {
    if (!gameState.isSubmitted || !gameState.currentPuzzle) return '';
    
    const [correct, total] = calculateScore();
    const emojiGrid = gameState.currentPuzzle.rows.map(row => {
      const rowResults = gameState.results[row.id];
      return rowResults?.map(result => result ? '🟩' : '🟥').join('');
    }).join('\n');

    return `Perfect Line: Grid Mode ${correct}/${total}\n\n${emojiGrid}\n\nPlay at: https://justinvickers.github.io/perfect-line/`;
  };

  const handleShare = () => {
    const shareText = generateShareText();
    console.log("Attempting to share:", shareText);
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            console.log("Share successful");
            alert('Results copied to clipboard!');
          })
          .catch(err => {
            console.error("Share failed:", err);
            alert('Failed to copy to clipboard. Try again or manually copy your results.');
          });
      } else {
        console.error("Clipboard API not available");
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          const msg = successful ? 'successful' : 'unsuccessful';
          console.log('Fallback: Copying text command was ' + msg);
          alert('Results copied to clipboard!');
        } catch (err) {
          console.error('Fallback: Could not copy text: ', err);
          alert('Failed to copy. Please manually copy your results.');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("Share error:", error);
      alert('An error occurred while trying to share. Please try again.');
    }
  };

  const handleReset = () => {
    setGameState({
      currentPuzzle: puzzle,
      userOrder: {},
      isSubmitted: false,
      results: {},
    });
  };

  const [correct, total] = calculateScore();

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 w-full flex flex-col items-center">
      <div className="text-center mb-6 w-full">
        <h1 className="text-3xl font-bold mb-2 text-white">Perfect Line</h1>
        <p className="text-gray-300 text-sm mb-2">Drag to arrange items in the correct order</p>
      </div>
      
      <div className="w-full mb-6">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {gameState.currentPuzzle?.rows.map((row) => (
            <SortableContext key={row.id} items={row.items.map(item => item.id)}>
              <GameRow
                rowId={row.id}
                prompt={row.prompt}
                items={row.items}
                isSubmitted={gameState.isSubmitted}
                correctPositions={gameState.results[row.id]}
              />
            </SortableContext>
          ))}
        </DndContext>
      </div>

      <div className="w-full mb-8">
        {gameState.isSubmitted ? (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md text-center">
              <p className="text-xl font-bold mb-2 text-white">Score: {correct}/{total}</p>
              <p className="text-sm text-gray-300 mb-4">
                {correct === total ? "Perfect!" : "Keep practicing!"}
              </p>
              
              <div className="mb-4">
                {gameState.currentPuzzle?.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center mb-1">
                    {gameState.results[row.id]?.map((result, index) => (
                      <div 
                        key={index} 
                        className="w-6 h-6 mx-0.5"
                        style={{
                          backgroundColor: result ? '#22c55e' : '#ef4444',
                          borderRadius: '4px'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Share
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-base"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}; 