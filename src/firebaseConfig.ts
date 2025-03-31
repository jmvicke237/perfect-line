// Firebase configuration using environment variables with obfuscation
// This approach helps avoid exposing API keys directly in bundled JS
export const firebaseConfig = {
  // Basic obfuscation to avoid directly exposing API key in bundled JS
  apiKey: (() => {
    // Check if we have the API key in environment variables first
    const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (envKey) {
      // Simple split-and-join to avoid direct string literals
      return envKey.split('').reverse().join('');
    }
    // Fallback to a disabled key for development
    return 'DISABLED_KEY';
  })(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}; 