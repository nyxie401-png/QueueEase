/**
 * QueueEase V2 — Socket.IO Client
 * Real-time WebSocket connection for live queue updates.
 */

import { io, Socket } from 'socket.io-client';
import type { QueueUpdateEvent, QueueStatusEvent, YourTurnEvent, TurnApproachingEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
    });

    // Queue update events
    this.socket.on('queue-updated', (data: QueueUpdateEvent) => {
      this.emit('queue-updated', data);
    });

    this.socket.on('queue-status-changed', (data: QueueStatusEvent) => {
      this.emit('queue-status-changed', data);
    });

    this.socket.on('your-turn', (data: YourTurnEvent) => {
      this.emit('your-turn', data);
    });

    this.socket.on('turn-approaching', (data: TurnApproachingEvent) => {
      this.emit('turn-approaching', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinQueueRoom(queueId: string) {
    this.socket?.emit('join-queue', queueId);
  }

  leaveQueueRoom(queueId: string) {
    this.socket?.emit('leave-queue', queueId);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) eventListeners.splice(index, 1);
    }
  }

  private emit(event: string, data: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(cb => cb(data));
    }
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;
