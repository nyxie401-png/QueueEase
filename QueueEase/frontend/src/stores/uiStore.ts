/**
 * QueueEase V2 — UI Store (Zustand)
 * Global UI state management.
 */

import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeScreen: string;
  isLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning';
  
  toggleSidebar: () => void;
  setActiveScreen: (screen: string) => void;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeScreen: 'dashboard',
  isLoading: false,
  toastMessage: null,
  toastType: 'info',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message, type = 'info') => set({ toastMessage: message, toastType: type }),
  hideToast: () => set({ toastMessage: null }),
}));
