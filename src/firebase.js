import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBeTNqgTnLrio1V10ugbH9ZHOyYsAR2yYU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'knot-cross-collective.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'knot-cross-collective',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'knot-cross-collective.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '698961489323',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:698961489323:web:09830adb32ef501f9df6ee',
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');
export default app;
