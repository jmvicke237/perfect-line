import { useState, useEffect } from 'react';
import { getCurrentSurveyQuestion, getYesterdaySurveyResults, saveSurveyResponse } from '../data/gameDataUtils';
import { SurveyQuestion, SurveyResponse, SurveyResult } from '../types/game';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable response item component
function SortableResponseItem({ 
  id, 
  name, 
  answer, 
  unit,
  isCorrect, 
  isWrong, 
  isSubmitted 
}: { 
  id: string; 
  name: string; 
  answer: number; 
  unit?: string;
  isCorrect?: boolean; 
  isWrong?: boolean; 
  isSubmitted?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transition,
    zIndex: isDragging ? 100 : 1,
    backgroundColor: isCorrect ? '#15803d' : isWrong ? '#b91c1c' : 'rgba(30, 27, 75, 0.7)',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    cursor: isSubmitted ? 'default' : 'grab',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    opacity: isDragging ? 0.8 : 1,
    transform: CSS.Transform.toString(transform),
    boxShadow: isDragging ? '0 5px 10px rgba(0, 0, 0, 0.15)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div style={{ fontWeight: '500' }}>
        {name}
        {isCorrect && <span style={{ marginLeft: '0.5rem' }}>✓</span>}
        {isWrong && <span style={{ marginLeft: '0.5rem' }}>✗</span>}
      </div>
      <div>
        {answer} {unit}
      </div>
    </div>
  );
}

const SurveyGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<SurveyQuestion | null>(null);
  const [yesterdayResults, setYesterdayResults] = useState<SurveyResult | null>(null);
  const [name, setName] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // New state for the drag-and-drop game
  const [userOrderedResponses, setUserOrderedResponses] = useState<SurveyResponse[]>([]);
  const [resultsSubmitted, setResultsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  
  useEffect(() => {
    // Load current question and yesterday's results
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load current question
        setCurrentQuestion(getCurrentSurveyQuestion());
        
        // Load yesterday's results (async)
        const results = await getYesterdaySurveyResults();
        setYesterdayResults(results);
        
        // Initialize the user's ordered responses with a shuffled copy of the results
        if (results && results.responses.length > 0) {
          // Shuffle the responses for the game
          const shuffled = [...results.responses].sort(() => Math.random() - 0.5);
          setUserOrderedResponses(shuffled);
        }
        
        // Check if the user has already submitted a response today
        const lastSubmitDateStr = localStorage.getItem('lastSurveySubmitDate');
        if (lastSubmitDateStr === new Date().toISOString().split('T')[0]) {
          setSubmitted(true);
        }
      } catch (error) {
        console.error("Error loading survey data:", error);
        setError("There was a problem loading the survey data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || resultsSubmitted) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    if (activeId === overId) return;

    setUserOrderedResponses(items => {
      const activeIndex = items.findIndex(item => `response-${item.timestamp}` === activeId);
      const overIndex = items.findIndex(item => `response-${item.timestamp}` === overId);
      
      return arrayMove(items, activeIndex, overIndex);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!answer.trim()) {
      setError('Please enter your answer');
      return;
    }
    
    const numericAnswer = parseFloat(answer);
    if (isNaN(numericAnswer) || numericAnswer < 0) {
      setError('Please enter a valid positive number');
      return;
    }
    
    if (!currentQuestion) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Save the response (now async)
      const response: SurveyResponse = {
        questionId: currentQuestion.id,
        date: currentQuestion.date,
        name: name.trim(),
        answer: numericAnswer,
        timestamp: new Date().toISOString()
      };
      
      await saveSurveyResponse(response);
      
      // Mark as submitted for today
      localStorage.setItem('lastSurveySubmitDate', new Date().toISOString().split('T')[0]);
      
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("There was a problem saving your response. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResultsSubmit = () => {
    if (!yesterdayResults) return;
    
    // Compare user's order with correct order (sorted by answer value)
    const correctOrder = [...yesterdayResults.responses].sort((a, b) => a.answer - b.answer);
    
    // Calculate score
    let correctCount = 0;
    const positions = userOrderedResponses.map((response, index) => {
      const correctIndex = correctOrder.findIndex(r => r.timestamp === response.timestamp);
      const isCorrect = correctIndex === index;
      if (isCorrect) correctCount++;
      return isCorrect;
    });
    
    setScore([correctCount, userOrderedResponses.length]);
    setResultsSubmitted(true);
  };

  const generateShareText = () => {
    if (!resultsSubmitted || !yesterdayResults) return '';
    
    const [correct, total] = score;
    const emojiGrid = userOrderedResponses.map((_, index) => {
      const isCorrect = index === score[0] - 1;
      return isCorrect ? '🟩' : '🟥';
    }).join('');

    return `Perfect Line: Survey Mode ${correct}/${total}\n\n${emojiGrid}\n\nPlay at: https://justinvickers.github.io/perfect-line/`;
  };

  const handleShare = () => {
    const shareText = generateShareText();
    console.log("Attempting to share:", shareText);
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText)
          .then(() => {
            alert('Results copied to clipboard!');
          })
          .catch(err => {
            console.error("Share failed:", err);
            alert('Failed to copy to clipboard. Try again or manually copy your results.');
          });
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
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
  
  const resetGame = () => {
    if (yesterdayResults) {
      const shuffled = [...yesterdayResults.responses].sort(() => Math.random() - 0.5);
      setUserOrderedResponses(shuffled);
      setResultsSubmitted(false);
      setScore([0, 0]);
    }
  };

  if (isLoading) {
    return (
      <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <p>Loading survey data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '32rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
          Daily Survey
        </h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1rem' }}>
          Answer today's question and order yesterday's results!
        </p>
      </div>
      
      {/* Yesterday's Results Game */}
      {yesterdayResults && yesterdayResults.responses.length > 1 && (
        <div style={{ 
          marginBottom: '2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(67, 56, 202, 0.7)', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', textAlign: 'center' }}>
            Yesterday's Question: 
            <div style={{ marginTop: '0.25rem', fontSize: '1rem' }}>
              {yesterdayResults.question.question}
            </div>
          </h3>
          
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', textAlign: 'center' }}>
              {resultsSubmitted ? 'Results (Ordered by Value):' : 'Drag to order from lowest to highest:'}
            </h4>
            
            <DndContext 
              collisionDetection={closestCenter} 
              onDragEnd={handleDragEnd}
            >
              <div style={{ 
                backgroundColor: 'rgba(30, 27, 75, 0.5)', 
                borderRadius: '0.375rem', 
                padding: '0.75rem' 
              }}>
                <SortableContext 
                  items={userOrderedResponses.map(r => `response-${r.timestamp}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {userOrderedResponses.map((response, index) => {
                    const isCorrect = resultsSubmitted && 
                      index === [...yesterdayResults.responses]
                        .sort((a, b) => a.answer - b.answer)
                        .findIndex(r => r.timestamp === response.timestamp);
                        
                    return (
                      <SortableResponseItem
                        key={`response-${response.timestamp}`}
                        id={`response-${response.timestamp}`}
                        name={response.name}
                        answer={resultsSubmitted ? response.answer : 0}
                        unit={yesterdayResults.question.unit}
                        isCorrect={isCorrect}
                        isWrong={resultsSubmitted && !isCorrect}
                        isSubmitted={resultsSubmitted}
                      />
                    );
                  })}
                </SortableContext>
              </div>
            </DndContext>
            
            {resultsSubmitted ? (
              <div style={{ 
                marginTop: '1rem', 
                textAlign: 'center',
                padding: '0.75rem',
                backgroundColor: score[0] === score[1] ? '#15803d' : '#b91c1c',
                color: 'white',
                borderRadius: '0.375rem',
                fontWeight: '500'
              }}>
                <p>Your score: {score[0]}/{score[1]}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={handleShare}
                    style={{ 
                      padding: '0.5rem 1rem',
                      backgroundColor: '#4f46e5',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Share Results
                  </button>
                  <button
                    onClick={resetGame}
                    style={{ 
                      padding: '0.5rem 1rem',
                      backgroundColor: '#6366f1',
                      borderRadius: '0.25rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Play Again
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleResultsSubmit}
                style={{ 
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginTop: '1rem'
                }}
              >
                Submit Your Order
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Today's Question */}
      {currentQuestion && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(67, 56, 202, 0.7)', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', textAlign: 'center' }}>
            Today's Question:
            <div style={{ marginTop: '0.25rem', fontSize: '1rem' }}>
              {currentQuestion.question}
            </div>
          </h3>
          
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="name" 
                  style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}
                >
                  Your Name:
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: 'rgba(30, 27, 75, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.25rem',
                    color: 'white'
                  }}
                  placeholder="Enter your name"
                  disabled={isSaving}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label 
                  htmlFor="answer" 
                  style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem' }}
                >
                  Your Answer:
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    id="answer"
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    style={{ 
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(30, 27, 75, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.25rem',
                      color: 'white'
                    }}
                    placeholder="Enter a number"
                    min="0"
                    step="any"
                    disabled={isSaving}
                  />
                  {currentQuestion.unit && (
                    <span style={{ marginLeft: '0.5rem' }}>{currentQuestion.unit}</span>
                  )}
                </div>
              </div>
              
              {error && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'rgba(220, 38, 38, 0.5)', 
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#1d4ed8',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  fontWeight: '500',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1
                }}
                disabled={isSaving}
              >
                {isSaving ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                Thanks for your response!
              </p>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Come back tomorrow to see how your answer compares to others.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyGame; 