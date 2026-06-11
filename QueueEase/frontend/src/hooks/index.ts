/**
 * QueueEase V2 — Custom Hooks
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { socketService } from '../services/socket';

/**
 * Hook for Socket.IO real-time updates
 * Accepts either a queueId string or an object of event handlers
 */
export function useSocket(eventHandlersOrQueueId?: Record<string, (...args: any[]) => void> | string) {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('queueease_token');
    socketService.connect(token || undefined);
    
    if (typeof eventHandlersOrQueueId === 'string') {
      socketService.joinQueueRoom(eventHandlersOrQueueId);
    }
    
    if (typeof eventHandlersOrQueueId === 'object' && eventHandlersOrQueueId !== null) {
      Object.entries(eventHandlersOrQueueId).forEach(([event, handler]) => {
        socketService.on(event, handler);
      });
    }
    
    socketService.on('queue-updated', (data: any) => {
      setLastUpdate(data);
    });
    
    return () => {
      if (typeof eventHandlersOrQueueId === 'string') {
        socketService.leaveQueueRoom(eventHandlersOrQueueId);
      }
      if (typeof eventHandlersOrQueueId === 'object' && eventHandlersOrQueueId !== null) {
        Object.entries(eventHandlersOrQueueId).forEach(([event, handler]) => {
          socketService.off(event, handler);
        });
      }
    };
  }, []);
  
  return { lastUpdate };
}

/**
 * Hook for countdown timer
 */
export function useCountdown(targetDate: Date | null) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    if (!targetDate) return;
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = Math.max(0, target - now);
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [targetDate]);
  
  return timeLeft;
}

/**
 * Hook for interval polling
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook for media query detection
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
}

/**
 * Hook for localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}
