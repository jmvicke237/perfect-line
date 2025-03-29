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
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm opacity-80 mb-2">{description}</p>
        <div className="text-sm font-medium">
          Round: {round}/{maxRounds} | Score: {score}/{maxRounds}
        </div>
      </div>

      {!gameOver ? (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center gap-4">
            {currentItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelection(item)}
                disabled={showingResult}
                className={`flex-1 p-6 rounded-lg text-center transition duration-200 ${
                  showingResult 
                    ? (item.id === selectedItemId 
                        ? (roundResult 
                            ? 'bg-green-500 border-2 border-green-300' // Selected and correct
                            : 'bg-red-500 border-2 border-red-300')    // Selected and wrong
                        : (item.id === winner?.id 
                            ? 'bg-green-600' // Correct answer (not selected)
                            : 'bg-indigo-700')) // Not selected, not winner
                    : 'bg-indigo-700 hover:bg-indigo-600' // Not showing result yet
                }`}
              >
                <div className="font-bold text-lg mb-2">{item.name}</div>
                {showingResult && (
                  <div className="flex flex-col items-center">
                    <div className="text-sm opacity-90 font-semibold">Value: {item.value}</div>
                    {item.id === selectedItemId && (
                      <div className="mt-2 text-sm font-bold">
                        {roundResult 
                          ? "✓ You picked correctly!" 
                          : "✗ Wrong choice"}
                      </div>
                    )}
                    {item.id === winner?.id && item.id !== selectedItemId && (
                      <div className="mt-2 text-sm font-bold">
                        ✓ This was the correct answer
                      </div>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {showingResult && (
            <div className={`p-3 text-center rounded-md ${roundResult ? 'bg-green-800' : 'bg-red-800'}`}>
              {roundResult 
                ? `Correct! ${winner?.name} has a higher ${attribute} (${winner?.value}).` 
                : `Incorrect. ${winner?.name} has a higher ${attribute} (${winner?.value}).`}
              {round < maxRounds && <div className="mt-2 text-xs opacity-75">The winning item will face a new challenger next round!</div>}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-6 bg-indigo-800 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Game Over!</h3>
          <p className="text-lg mb-4">Your final score: {score}/{maxRounds}</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparativeGame; 