/**
 * Firebase service for React Native.
 * Uses @react-native-firebase/* packages which are RN-compatible.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || 'https://your-project.firebaseio.com',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Avoid duplicate initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const firebaseAuth = getAuth(app);
export const firebaseDatabase = getDatabase(app);

export default app;
