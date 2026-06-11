/**
 * QueueEase V2 — Firebase Configuration
 * Placeholder for Firebase Auth integration.
 * 
 * To implement:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Email/Password + Phone)
 * 3. Add your web app config below
 * 4. Enable Cloud Messaging for push notifications
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration: VITE_FIREBASE_API_KEY is required');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Messaging (only in browsers that support it)
export let messaging: ReturnType<typeof getMessaging> | null = null;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

// FCM VAPID key (replace with your own)
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'your-vapid-key';

export default app;
