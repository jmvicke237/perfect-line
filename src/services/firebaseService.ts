import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { SurveyResponse } from '../types/game';
import { firebaseConfig } from '../firebaseConfig';

// De-obfuscate the API key before initializing Firebase
const deobfuscatedConfig = {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey.split('').reverse().join('')
};

// Initialize Firebase with deobfuscated config
const app = initializeApp(deobfuscatedConfig);
const db = getFirestore(app);

// Initialize Analytics if in browser environment
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

// Save a survey response to Firestore
export const saveSurveyResponseToFirebase = async (response: SurveyResponse): Promise<void> => {
  try {
    await addDoc(collection(db, 'surveyResponses'), response);
    console.log('Response saved to Firestore');
  } catch (error) {
    console.error("Error saving response to Firestore: ", error);
    throw error;
  }
};

// Get survey responses for a specific date and question
export const getSurveyResponsesFromFirebase = async (date: string, questionId: string): Promise<SurveyResponse[]> => {
  console.log(`Querying Firestore for surveyResponses with date: ${date}, questionId: ${questionId}`); // LOG: Query details
  try {
    const q = query(
      collection(db, 'surveyResponses'), 
      where('date', '==', date),
      where('questionId', '==', questionId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Firestore query returned ${querySnapshot.size} documents.`); // LOG: Count returned by Firestore
    const responses: SurveyResponse[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      console.log(`Processing document ID: ${doc.id}`, doc.data()); // LOG: Each document processed
      // Basic check for expected structure before pushing
      const data = doc.data();
      if (data && typeof data.name === 'string' && typeof data.answer === 'number') {
        responses.push(data as SurveyResponse);
      } else {
        console.warn(`Skipping document ID: ${doc.id} due to unexpected data structure or missing fields.`, data);
      }
    });
    
    console.log(`Returning ${responses.length} processed responses.`); // LOG: Count after processing
    return responses;
  } catch (error) {
    console.error("Error getting responses from Firestore: ", error);
    return [];
  }
}; 