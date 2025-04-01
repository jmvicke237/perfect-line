import dailyContentData from './dailyContent.json';
import { Puzzle, Row, Item, ComparativePuzzle, SingleSequencePuzzle, SingleSequenceItem, SurveyQuestion, SurveyResponse, SurveyResult } from '../types/game';
import { saveSurveyResponseToFirebase, getSurveyResponsesFromFirebase } from '../services/firebaseService';

// Daily Content Types
interface DailyContent {
  date: string;
  name: string;
  description: string;
  comparative?: ComparativePuzzleDefinition;
  sequence?: SingleSequencePuzzleDefinition;
  survey?: SurveyQuestionDefinition;
}

interface ComparativePuzzleDefinition {
  id: string;
  name: string;
  description: string;
  attribute: string;
  items: ComparativeItem[];
}

interface ComparativeItem {
  id: string;
  name: string;
  value: number;
}

interface SingleSequencePuzzleDefinition {
  id: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  items: {
    displayValue: string | number;
    longText?: string;
    shortText: string;
  }[];
}

interface SurveyQuestionDefinition {
  id: string;
  question: string;
  unit?: string;
}

// Helper Functions

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Get yesterday's date in YYYY-MM-DD format
const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Get all daily content entries
export const getAllDailyContent = (): DailyContent[] => {
  return dailyContentData.dailyContent as DailyContent[];
};

// Get daily content for a specific date
export const getDailyContentForDate = (dateString: string): DailyContent | undefined => {
  return getAllDailyContent().find(content => content.date === dateString);
};

// Get today's daily content
export const getTodaysDailyContent = (): DailyContent | undefined => {
  return getDailyContentForDate(getTodayDate());
};

// Get yesterday's daily content
export const getYesterdaysDailyContent = (): DailyContent | undefined => {
  return getDailyContentForDate(getYesterdayDate());
};

// Fallback to random content if no content is available for the date
export const getDailyContentWithFallback = (dateString: string): DailyContent | null => {
  const content = getDailyContentForDate(dateString);
  if (content) return content;
  
  // If no content is found, return a random one
  const allContent = getAllDailyContent();
  if (allContent.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * allContent.length);
  return allContent[randomIndex];
};

// COMPARATIVE GAME FUNCTIONS

// Get the comparative puzzle for a specific date
export const getDailyComparativePuzzle = (dateString?: string): ComparativePuzzle | null => {
  // If no date is provided, use today's date
  const targetDate = dateString || getTodayDate();
  
  // Get the daily content for this date with fallback
  const dailyContent = getDailyContentWithFallback(targetDate);
  
  // If no comparative puzzle is defined, return null
  if (!dailyContent || !dailyContent.comparative) {
    console.warn(`No comparative puzzle defined for date ${targetDate}`);
    return null;
  }
  
  // Convert the definition to a playable puzzle
  const puzzleDef = dailyContent.comparative;
  
  return {
    id: puzzleDef.id,
    name: puzzleDef.name,
    description: puzzleDef.description,
    attribute: puzzleDef.attribute,
    items: puzzleDef.items.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value
    }))
  };
};

// Get a random comparative puzzle
export const getRandomComparativePuzzle = (): ComparativePuzzle | null => {
  const allContent = getAllDailyContent();
  // Filter content to only those with comparative puzzles
  const comparativeContent = allContent.filter(content => content.comparative);
  
  if (comparativeContent.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * comparativeContent.length);
  const randomContent = comparativeContent[randomIndex];
  
  if (!randomContent.comparative) return null;
  
  const puzzleDef = randomContent.comparative;
  
  return {
    id: puzzleDef.id,
    name: puzzleDef.name,
    description: puzzleDef.description,
    attribute: puzzleDef.attribute,
    items: puzzleDef.items.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value
    }))
  };
};

// SEQUENCE GAME FUNCTIONS

// Get a sequence puzzle for a specific date
export const getDailySequencePuzzle = (dateString?: string): SingleSequencePuzzle | null => {
  // If no date is provided, use today's date
  const targetDate = dateString || getTodayDate();
  
  // Get the daily content for this date with fallback
  const dailyContent = getDailyContentWithFallback(targetDate);
  
  // If no sequence puzzle is defined, return null
  if (!dailyContent || !dailyContent.sequence) {
    console.warn(`No sequence puzzle defined for date ${targetDate}`);
    return getRandomSequencePuzzle();
  }
  
  // Convert the definition to a playable puzzle
  const puzzleDef = dailyContent.sequence;
  
  // Create items with unique IDs
  const items: SingleSequenceItem[] = puzzleDef.items.map((item, index) => {
    return {
      id: `item-${index}`,
      shortText: item.shortText,
      longText: item.longText,
      displayValue: item.displayValue
    };
  });

  return {
    id: puzzleDef.id,
    prompt: puzzleDef.prompt,
    leftLabel: puzzleDef.leftLabel,
    rightLabel: puzzleDef.rightLabel,
    items,
    difficulty: "medium" // Default value
  };
};

// Get a random sequence puzzle
export const getRandomSequencePuzzle = (): SingleSequencePuzzle | null => {
  const allContent = getAllDailyContent();
  // Filter content to only those with sequence puzzles
  const sequenceContent = allContent.filter(content => content.sequence);
  
  if (sequenceContent.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * sequenceContent.length);
  const randomContent = sequenceContent[randomIndex];
  
  if (!randomContent.sequence) return null;
  
  // Convert the definition to a playable puzzle
  const puzzleDef = randomContent.sequence;
  
  // Create items with unique IDs
  const items: SingleSequenceItem[] = puzzleDef.items.map((item, index) => {
    return {
      id: `item-${index}`,
      shortText: item.shortText,
      longText: item.longText,
      displayValue: item.displayValue
    };
  });

  return {
    id: puzzleDef.id,
    prompt: puzzleDef.prompt,
    leftLabel: puzzleDef.leftLabel,
    rightLabel: puzzleDef.rightLabel,
    items,
    difficulty: "medium" // Default value
  };
};

// SURVEY GAME FUNCTIONS

// Get today's survey question
export const getCurrentSurveyQuestion = (): SurveyQuestion | null => {
  const todayContent = getTodaysDailyContent();
  
  if (!todayContent || !todayContent.survey) {
    // Fallback to a random survey question
    const allContent = getAllDailyContent();
    const surveyContent = allContent.filter(content => content.survey);
    
    if (surveyContent.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * surveyContent.length);
    const randomContent = surveyContent[randomIndex];
    
    if (!randomContent.survey) return null;
    
    return {
      id: randomContent.survey.id,
      date: getTodayDate(),
      question: randomContent.survey.question,
      unit: randomContent.survey.unit
    };
  }
  
  return {
    id: todayContent.survey.id,
    date: todayContent.date,
    question: todayContent.survey.question,
    unit: todayContent.survey.unit
  };
};

// Get yesterday's survey question
export const getYesterdaySurveyQuestion = (): SurveyQuestion | null => {
  const yesterdayContent = getYesterdaysDailyContent();
  
  if (!yesterdayContent || !yesterdayContent.survey) {
    // Just return null if there's no yesterday survey
    return null;
  }
  
  return {
    id: yesterdayContent.survey.id,
    date: yesterdayContent.date,
    question: yesterdayContent.survey.question,
    unit: yesterdayContent.survey.unit
  };
};

// Save a survey response - save to both Firebase and localStorage
export const saveSurveyResponse = async (response: SurveyResponse): Promise<void> => {
  // First, try to save to Firebase
  try {
    await saveSurveyResponseToFirebase(response);
  } catch (error) {
    console.error("Error saving to Firebase, falling back to localStorage", error);
    // If Firebase fails, fall back to localStorage
    saveToLocalStorage(response);
  }
  
  // Always save the submission flag locally
  localStorage.setItem('lastSurveySubmitDate', new Date().toISOString().split('T')[0]);
};

// Helper function to save to localStorage (used as fallback)
const saveToLocalStorage = (response: SurveyResponse): void => {
  const storageKey = `surveyResponses_${response.date}_${response.questionId}`;
  
  // Get existing responses
  const existingResponsesJSON = localStorage.getItem(storageKey);
  let responses: SurveyResponse[] = existingResponsesJSON ? JSON.parse(existingResponsesJSON) : [];
  
  // Add the new response
  responses.push(response);
  
  // Save back to localStorage
  localStorage.setItem(storageKey, JSON.stringify(responses));
};

// Get survey responses for a specific date and question
export const getSurveyResponses = async (date: string, questionId: string): Promise<SurveyResponse[]> => {
  try {
    // First try to get from Firebase
    const firebaseResponses = await getSurveyResponsesFromFirebase(date, questionId);
    
    if (firebaseResponses.length > 0) {
      return firebaseResponses;
    }
    
    // If no Firebase responses, fall back to localStorage
    console.log("No responses found in Firebase, checking localStorage");
    return getFromLocalStorage(date, questionId);
  } catch (error) {
    console.error("Error getting responses from Firebase, falling back to localStorage", error);
    return getFromLocalStorage(date, questionId);
  }
};

// Helper function to get from localStorage (used as fallback)
const getFromLocalStorage = (date: string, questionId: string): SurveyResponse[] => {
  const storageKey = `surveyResponses_${date}_${questionId}`;
  
  const responsesJSON = localStorage.getItem(storageKey);
  if (!responsesJSON) return [];
  
  return JSON.parse(responsesJSON);
};

// Get yesterday's survey results
export const getYesterdaySurveyResults = async (): Promise<SurveyResult | null> => {
  const yesterdayQuestion = getYesterdaySurveyQuestion();
  if (!yesterdayQuestion) return null;
  
  const responses = await getSurveyResponses(yesterdayQuestion.date, yesterdayQuestion.id);
  
  return {
    question: yesterdayQuestion,
    responses
  };
}; 