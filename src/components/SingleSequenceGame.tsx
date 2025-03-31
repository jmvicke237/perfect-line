import { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SingleSequencePuzzle, SingleSequenceGameState } from '../types/game';

interface SingleSequenceGameProps {
  puzzle: SingleSequencePuzzle;
}

interface SortableItemProps {
  id: string;
  text: string;
  displayValue?: string | number;
  isCorrect?: boolean;
  isWrong?: boolean;
  isSubmitted: boolean;
}

// Sortable item component
const SortableItem = ({ id, text, displayValue, isCorrect, isWrong, isSubmitted }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isSubmitted
      ? isCorrect
        ? '#22c55e' // Green for correct
        : isWrong
          ? '#ef4444' // Red for wrong
          : '#4338ca' // Default indigo
      : '#4338ca', // Default indigo
    padding: '1rem',
    borderRadius: '0.5rem',
    userSelect: 'none' as 'none',
    cursor: isSubmitted ? 'default' : 'grab',
    color: 'white',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isSubmitted ? {} : listeners)}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {text}
      </div>
      {isSubmitted && displayValue && (
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
          {displayValue}
        </div>
      )}
    </div>
  );
};

const SingleSequenceGame = ({ puzzle }: SingleSequenceGameProps) => {
  const [gameState, setGameState] = useState<SingleSequenceGameState>({
    currentPuzzle: puzzle,
    userOrder: [...puzzle.items.map(item => item.id)].sort(() => Math.random() - 0.5),
    isSubmitted: false,
    results: [],
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || gameState.isSubmitted) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    const oldIndex = gameState.userOrder.indexOf(activeId);
    const newIndex = gameState.userOrder.indexOf(overId);
    
    if (oldIndex === newIndex) return;

    const newUserOrder = arrayMove(gameState.userOrder, oldIndex, newIndex);
    
    setGameState(prev => ({
      ...prev,
      userOrder: newUserOrder,
    }));
  };

  const handleSubmit = () => {
    if (!gameState.currentPuzzle) return;

    // Get the correct numerical values in ascending order
    const correctOrderItems = [...gameState.currentPuzzle.items].sort((a, b) => {
      const valueA = typeof a.displayValue === 'string' ? parseFloat(a.displayValue) : a.displayValue;
      const valueB = typeof b.displayValue === 'string' ? parseFloat(b.displayValue) : b.displayValue;
      return Number(valueA) - Number(valueB);
    });
    
    // Map item IDs to their correct indices for reference
    const correctPositionMap = new Map<string, number>();
    correctOrderItems.forEach((item, index) => {
      correctPositionMap.set(item.id, index);
    });
    
    // Convert user order to correct position indices
    const userOrderPositions = gameState.userOrder.map(itemId => {
      return correctPositionMap.get(itemId) ?? -1;
    });
    
    // Find the longest increasing subsequence of positions
    const lis = findLongestIncreasingSubsequence(userOrderPositions);
    
    // Mark items as correct if they're in the LIS
    const results = Array(gameState.userOrder.length).fill(false);
    lis.forEach(index => {
      results[index] = true;
    });
    
    setGameState(prev => ({
      ...prev,
      isSubmitted: true,
      results,
    }));
  };

  // Function to find the longest increasing subsequence (indices in the original array)
  const findLongestIncreasingSubsequence = (arr: number[]): number[] => {
    if (arr.length === 0) return [];
    
    // lengths[i] = length of LIS ending at arr[i]
    const lengths = Array(arr.length).fill(1);
    
    // prevIndices[i] = previous index in the LIS ending at arr[i]
    const prevIndices = Array(arr.length).fill(-1);
    
    // Find the lengths of all LIS
    for (let i = 1; i < arr.length; i++) {
      for (let j = 0; j < i; j++) {
        if (arr[j] < arr[i] && lengths[j] + 1 > lengths[i]) {
          lengths[i] = lengths[j] + 1;
          prevIndices[i] = j;
        }
      }
    }
    
    // Find the index of the maximum length
    let maxLengthIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (lengths[i] > lengths[maxLengthIndex]) {
        maxLengthIndex = i;
      }
    }
    
    // Reconstruct the LIS (indices in the original array)
    const result: number[] = [];
    let currentIndex = maxLengthIndex;
    
    while (currentIndex !== -1) {
      result.unshift(currentIndex); // Add to the front
      currentIndex = prevIndices[currentIndex];
    }
    
    return result;
  };

  const calculateScore = (): [number, number] => {
    if (!gameState.isSubmitted) return [0, 0];
    
    let correct = 0;
    gameState.results.forEach(result => {
      if (result) correct++;
    });
    
    return [correct, gameState.results.length];
  };

  const generateShareText = () => {
    if (!gameState.isSubmitted) return '';
    
    const [correct, total] = calculateScore();
    const emojiLine = gameState.results.map(result => result ? '🟩' : '🟥').join('');

    return `Perfect Line: Sequence Mode ${correct}/${total}\n\n${emojiLine}\n\nPlay at: https://justinvickers.github.io/perfect-line/`;
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
      userOrder: [...puzzle.items.map(item => item.id)].sort(() => Math.random() - 0.5),
      isSubmitted: false,
      results: [],
    });
  };

  const [correct, total] = calculateScore();

  if (!gameState.currentPuzzle) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
          {gameState.currentPuzzle.prompt}
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <div>{gameState.currentPuzzle.leftLabel}</div>
          <div>{gameState.currentPuzzle.rightLabel}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={gameState.userOrder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              {gameState.userOrder.map((itemId, index) => {
                const item = gameState.currentPuzzle?.items.find(i => i.id === itemId);
                if (!item) return null;
                
                return (
                  <SortableItem
                    key={itemId}
                    id={itemId}
                    text={item.shortText}
                    displayValue={item.displayValue}
                    isCorrect={gameState.isSubmitted && gameState.results[index]}
                    isWrong={gameState.isSubmitted && !gameState.results[index]}
                    isSubmitted={gameState.isSubmitted}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div>
        {gameState.isSubmitted ? (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: 'rgba(67, 56, 202, 0.7)', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Score: {correct}/{total}
            </p>
            <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
              {correct === total ? "Perfect!" : "Keep practicing!"}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', gap: '0.25rem' }}>
              {gameState.results.map((result, index) => (
                <div 
                  key={index} 
                  style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    backgroundColor: result ? '#22c55e' : '#ef4444',
                    borderRadius: '0.25rem'
                  }}
                />
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleShare}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Share
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#1d4ed8',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default SingleSequenceGame; 