import { useState, useEffect } from 'react';
import { Item } from '../types/game';

interface ComparativeGameProps {
  items: Item[];
  maxRounds: number;
  title: string;
  description: string;
  attribute?: string;
}

const ComparativeGame: React.FC<ComparativeGameProps> = ({ 
  items, 
  maxRounds = 6,
  title,
  description,
  attribute = "value"
}) => {
  const [currentItems, setCurrentItems] = useState<[Item, Item] | null>(null);
  const [remainingItems, setRemainingItems] = useState<Item[]>([]);
  const [winner, setWinner] = useState<Item | null>(null);
  const [roundResult, setRoundResult] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [showingResult, setShowingResult] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [playAgainHovered, setPlayAgainHovered] = useState(false);

  // Initialize the game
  useEffect(() => {
    if (items.length < maxRounds + 1) {
      console.error("Not enough items provided for the game");
      return;
    }
    
    // Shuffle the items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setRemainingItems(shuffled.slice(2));
    setCurrentItems([shuffled[0], shuffled[1]]);
    setRound(1);
    setScore(0);
    setGameOver(false);
    setWinner(null);
    setRoundResult(null);
    setSelectedItemId(null);
  }, [items, maxRounds]);

  const handleSelection = (selectedItem: Item) => {
    if (showingResult || !currentItems) return;
    
    // Determine if selection was correct
    const [itemA, itemB] = currentItems;
    const higherValueItem = itemA.value! > itemB.value! ? itemA : itemB;
    const isCorrect = selectedItem.id === higherValueItem.id;
    
    // Update score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Save the selected item ID
    setSelectedItemId(selectedItem.id);
    
    // Show result with attribute information
    setRoundResult(isCorrect);
    setWinner(higherValueItem);
    setShowingResult(true);
    
    // Set timeout to move to next round
    setTimeout(() => {
      if (round >= maxRounds) {
        setGameOver(true);
      } else {
        const nextRound = round + 1;
        setRound(nextRound);
        
        // Keep the winner and add a new challenger
        if (remainingItems.length > 0) {
          const nextItem = remainingItems[0];
          setCurrentItems([higherValueItem, nextItem]);
          setRemainingItems(prev => prev.slice(1));
        }
        
        setShowingResult(false);
        setWinner(null);
        setRoundResult(null);
        setSelectedItemId(null);
      }
    }, 1500);
  };

  const resetGame = () => {
    // Shuffle the items
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setRemainingItems(shuffled.slice(2));
    setCurrentItems([shuffled[0], shuffled[1]]);
    setRound(1);
    setScore(0);
    setGameOver(false);
    setWinner(null);
    setRoundResult(null);
    setShowingResult(false);
    setSelectedItemId(null);
  };

  if (!currentItems) {
    return <div className="text-center p-4">Loading game...</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{description}</p>
        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
          Round: {round}/{maxRounds} | Score: {score}/{maxRounds}
        </div>
      </div>

      {!gameOver ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            {currentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelection(item)}
                disabled={showingResult}
                onMouseEnter={() => !showingResult && setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  transition: 'all 0.2s',
                  backgroundColor: showingResult 
                    ? (item.id === selectedItemId 
                      ? (roundResult ? '#22c55e' : '#ef4444') // Green or red for selection
                      : (item.id === winner?.id ? '#16a34a' : '#4338ca')) // Green for winner, indigo for others
                    : hoveredItemId === item.id ? '#4f46e5' : '#4338ca', // Lighter indigo on hover
                  border: showingResult && (item.id === selectedItemId || item.id === winner?.id)
                    ? '3px solid white'
                    : 'none',
                  cursor: showingResult ? 'default' : 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem', color: 'white' }}>
                  {item.name}
                </div>
                {showingResult && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'white' }}>
                      Value: {item.value}
                    </div>
                    {item.id === selectedItemId && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>
                        {roundResult 
                          ? "✓ You picked correctly!" 
                          : "✗ Wrong choice"}
                      </div>
                    )}
                    {item.id === winner?.id && item.id !== selectedItemId && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: 'bold', color: 'white' }}>
                        ✓ This was the correct answer
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {showingResult && (
            <div style={{
              padding: '0.75rem',
              textAlign: 'center',
              borderRadius: '0.375rem',
              backgroundColor: roundResult ? '#15803d' : '#b91c1c',
              color: 'white',
              fontWeight: '500'
            }}>
              {roundResult 
                ? `Correct! ${winner?.name} has a higher ${attribute} (${winner?.value}).` 
                : `Incorrect. ${winner?.name} has a higher ${attribute} (${winner?.value}).`}
              {round < maxRounds && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: '0.75' }}>
                  The winning item will face a new challenger next round!
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          backgroundColor: '#3730a3',
          borderRadius: '0.5rem',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Game Over!</h3>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Your final score: {score}/{maxRounds}</p>
          <button
            onClick={resetGame}
            onMouseEnter={() => setPlayAgainHovered(true)}
            onMouseLeave={() => setPlayAgainHovered(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: playAgainHovered ? '#6366f1' : '#4f46e5',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              color: 'white',
              transition: 'background-color 0.2s'
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparativeGame; 