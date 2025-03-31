import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { SurveyResponse } from '../types/game';
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
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
  try {
    const q = query(
      collection(db, 'surveyResponses'), 
      where('date', '==', date),
      where('questionId', '==', questionId)
    );
    
    const querySnapshot = await getDocs(q);
    const responses: SurveyResponse[] = [];
    
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      responses.push(doc.data() as SurveyResponse);
    });
    
    return responses;
  } catch (error) {
    console.error("Error getting responses from Firestore: ", error);
    return [];
  }
}; 