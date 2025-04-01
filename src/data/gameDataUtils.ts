/**
 * Game Data Utilities
 * 
 * This file provides functions to retrieve, manipulate, and manage game data for all game modes
 * including comparative puzzles, sequence puzzles, and survey questions.
 * 
 * The data is sourced from the consolidated dailyContent.json file which contains all puzzles
 * organized by date.
 */

import dailyContentData from './dailyContent.json';
import { Puzzle, Row, Item, ComparativePuzzle, SingleSequencePuzzle, SingleSequenceItem, SurveyQuestion, SurveyResponse, SurveyResult } from '../types/game';
import { saveSurveyResponseToFirebase, getSurveyResponsesFromFirebase } from '../services/firebaseService';

// Daily Content Types
/**
 * Represents a complete set of content for a specific date
 * May include different types of puzzles (comparative, sequence, survey)
 */
interface DailyContent {
  date: string;
  name: string;
  comparative?: ComparativePuzzleDefinition;
  sequence?: SingleSequencePuzzleDefinition;
  survey?: SurveyQuestionDefinition;
}

/**
 * Definition for a comparative puzzle
 */
interface ComparativePuzzleDefinition {
  id: string;
  name: string;
  description: string;
  attribute: string;
  items: ComparativeItem[];
}

/**
 * Item used in comparative puzzles
 */
interface ComparativeItem {
  id: string;
  name: string;
  value: number;
}

/**
 * Definition for a sequence puzzle
 */
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

/**
 * Definition for a survey question
 */
interface SurveyQuestionDefinition {
  id: string;
  question: string;
  unit?: string;
}

// Helper Functions

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayDate = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Get all daily content entries from the JSON file
 */
export const getAllDailyContent = (): DailyContent[] => {
  return dailyContentData.dailyContent as DailyContent[];
};

/**
 * Get daily content for a specific date
 * @param dateString Date in YYYY-MM-DD format
 */
export const getDailyContentForDate = (dateString: string): DailyContent | undefined => {
  return getAllDailyContent().find(content => content.date === dateString);
};

/**
 * Get today's daily content
 */
export const getTodaysDailyContent = (): DailyContent | undefined => {
  return getDailyContentForDate(getTodayDate());
};

/**
 * Get yesterday's daily content
 */
export const getYesterdaysDailyContent = (): DailyContent | undefined => {
  return getDailyContentForDate(getYesterdayDate());
};

/**
 * Get daily content for a given date with fallback to random content if none exists
 * @param dateString Date in YYYY-MM-DD format
 */
export const getDailyContentWithFallback = (dateString: string): DailyContent | null => {
  const content = getDailyContentForDate(dateString);
  if (content) return content;
  
  // If no content is found, return a random one
  const allContent = getAllDailyContent();
  if (allContent.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * allContent.length);
  return allContent[randomIndex];
};

// --------------------------------------
// COMPARATIVE GAME FUNCTIONS
// --------------------------------------

/**
 * Get the comparative puzzle for a specific date
 * @param dateString Date in YYYY-MM-DD format (defaults to today)
 * @returns ComparativePuzzle or null if none exists
 */
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

/**
 * Get a random comparative puzzle
 * @returns ComparativePuzzle or null if none exists
 */
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

// --------------------------------------
// SEQUENCE GAME FUNCTIONS
// --------------------------------------

/**
 * Get a sequence puzzle for a specific date
 * @param dateString Date in YYYY-MM-DD format (defaults to today)
 * @returns SingleSequencePuzzle or null if none exists
 */
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

/**
 * Get a random sequence puzzle
 * @returns SingleSequencePuzzle or null if none exists
 */
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

// --------------------------------------
// SURVEY GAME FUNCTIONS
// --------------------------------------

/**
 * Get today's survey question
 * @returns SurveyQuestion or null if none exists
 */
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

/**
 * Get yesterday's survey question
 * @returns SurveyQuestion or null if none exists
 */
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

/**
 * Save a survey response - save to both Firebase and localStorage
 * @param response The survey response to save
 */
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

/**
 * Helper function to save to localStorage (used as fallback)
 * @param response The survey response to save
 */
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

/**
 * Get survey responses for a specific date and question
 * @param date Date in YYYY-MM-DD format
 * @param questionId ID of the survey question
 */
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

/**
 * Helper function to get from localStorage (used as fallback)
 * @param date Date in YYYY-MM-DD format
 * @param questionId ID of the survey question
 */
const getFromLocalStorage = (date: string, questionId: string): SurveyResponse[] => {
  const storageKey = `surveyResponses_${date}_${questionId}`;
  
  const responsesJSON = localStorage.getItem(storageKey);
  if (!responsesJSON) return [];
  
  return JSON.parse(responsesJSON);
};

/**
 * Get yesterday's survey results
 * @returns SurveyResult (including question and responses) or null if none exists
 */
export const getYesterdaySurveyResults = async (): Promise<SurveyResult | null> => {
  const yesterdayQuestion = getYesterdaySurveyQuestion();
  if (!yesterdayQuestion) return null;
  
  const responses = await getSurveyResponses(yesterdayQuestion.date, yesterdayQuestion.id);
  
  return {
    question: yesterdayQuestion,
    responses
  };
}; 