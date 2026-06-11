/**
 * QueueEase V2 — FCM Push Notification Service
 * Placeholder for Firebase Cloud Messaging integration.
 */

import { messaging, VAPID_KEY } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!messaging) {
      console.log('📱 Messaging not supported in this browser');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('📱 Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('📱 FCM Token:', token);
    return token;
  } catch (error) {
    console.error('📱 FCM token error:', error);
    return null;
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('📱 Foreground message:', payload);
    callback(payload);
  });
}

/**
 * Register service worker for background notifications
 */
export async function registerNotificationWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('📱 Service worker registered:', registration.scope);
    } catch (error) {
      console.error('📱 Service worker registration failed:', error);
    }
  }
}
