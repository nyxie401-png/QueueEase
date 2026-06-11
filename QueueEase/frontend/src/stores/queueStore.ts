/**
 * QueueEase V2 — Queue Store (Zustand)
 */

import { create } from 'zustand';
import api from '../services/api';
import { socketService } from '../services/socket';

interface QueueState {
  queue: any | null;
  myEntry: any | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTodayQueue: (clinicId?: string) => Promise<any>;
  joinQueue: (data?: any) => Promise<any>;
  callNext: (queueId?: string) => Promise<any>;
  completeConsultation: (entryId: string, notes?: string) => Promise<void>;
  cancelEntry: (entryId: string, reason?: string) => Promise<void>;
  addEmergency: (data?: any) => Promise<any>;
  togglePause: () => Promise<void>;
  closeQueue: () => Promise<void>;
  subscribeToQueue: (queueId?: string) => void;
  unsubscribeFromQueue: (queueId?: string) => void;
  clearError: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: null,
  myEntry: null,
  isLoading: false,
  error: null,

  fetchTodayQueue: async (clinicId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = clinicId
        ? `/queues/clinic/${clinicId}/today`
        : '/queues/today';
      const response = await api.get(endpoint);
      const queueData = response.data?.data;
      set({ queue: queueData, isLoading: false });
      return queueData;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to fetch queue' });
      throw error;
    }
  },

  joinQueue: async (data = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queue = get().queue;
      const queueId = queue?._id || 'current';
      const response = await api.post(`/queues/${queueId}/join`, data);
      const entry = response.data?.data;
      set({ myEntry: entry, isLoading: false });
      // Refresh queue
      await get().fetchTodayQueue();
      return entry;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to join queue' });
      throw error;
    }
  },

  callNext: async (queueId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const id = queueId || get().queue?._id || 'current';
      const response = await api.post(`/queues/${id}/call-next`);
      await get().fetchTodayQueue();
      set({ isLoading: false });
      return response.data?.data;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to call next' });
      throw error;
    }
  },

  completeConsultation: async (entryId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const queueId = get().queue?._id || 'current';
      await api.post(`/queues/${queueId}/complete`, { entryId, notes });
      await get().fetchTodayQueue();
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to complete' });
      throw error;
    }
  },

  cancelEntry: async (entryId: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const queueId = get().queue?._id || 'current';
      await api.post(`/queues/${queueId}/cancel/${entryId}`, { reason });
      await get().fetchTodayQueue();
      set({ myEntry: null, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to cancel' });
      throw error;
    }
  },

  addEmergency: async (data = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queueId = get().queue?._id || 'current';
      const response = await api.post(`/queues/${queueId}/emergency`, data);
      await get().fetchTodayQueue();
      set({ isLoading: false });
      return response.data?.data;
    } catch (error: any) {
      set({ isLoading: false, error: error.response?.data?.message || 'Failed to add emergency' });
      throw error;
    }
  },

  togglePause: async () => {
    try {
      const queueId = get().queue?._id || 'current';
      await api.post(`/queues/${queueId}/pause`);
      await get().fetchTodayQueue();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to toggle pause' });
      throw error;
    }
  },

  closeQueue: async () => {
    try {
      const queueId = get().queue?._id || 'current';
      await api.post(`/queues/${queueId}/close`);
      await get().fetchTodayQueue();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to close queue' });
      throw error;
    }
  },

  subscribeToQueue: (queueId?: string) => {
    if (queueId) {
      socketService.joinQueueRoom(queueId);
    }

    socketService.on('queue-updated', () => {
      get().fetchTodayQueue();
    });

    socketService.on('queue-status-changed', () => {
      get().fetchTodayQueue();
    });
  },

  unsubscribeFromQueue: (queueId?: string) => {
    if (queueId) {
      socketService.leaveQueueRoom(queueId);
    }
  },

  clearError: () => set({ error: null }),
}));
