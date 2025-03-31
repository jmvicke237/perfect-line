import { useState, useEffect } from 'react';
import { getCurrentSurveyQuestion, getYesterdaySurveyResults, saveSurveyResponse } from '../data/gameDataUtils';
import { SurveyQuestion, SurveyResponse, SurveyResult } from '../types/game';

const SurveyGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<SurveyQuestion | null>(null);
  const [yesterdayResults, setYesterdayResults] = useState<SurveyResult | null>(null);
  const [name, setName] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
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

  // Sort responses from lowest to highest
  const sortedResponses = yesterdayResults?.responses.slice() || [];
  sortedResponses.sort((a, b) => a.answer - b.answer);

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
          Answer today's question and see yesterday's results!
        </p>
      </div>
      
      {/* Yesterday's Results */}
      {yesterdayResults && (
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
              Results (Lowest to Highest):
            </h4>
            {sortedResponses.length > 0 ? (
              <div style={{ 
                backgroundColor: 'rgba(30, 27, 75, 0.5)', 
                borderRadius: '0.375rem', 
                padding: '0.75rem' 
              }}>
                {sortedResponses.map((response, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '0.5rem',
                      borderBottom: index < sortedResponses.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{response.name}</div>
                    <div>
                      {response.answer} {yesterdayResults.question.unit}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '0.75rem', 
                backgroundColor: 'rgba(30, 27, 75, 0.5)', 
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                opacity: '0.8'
              }}>
                No responses yet.
              </div>
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