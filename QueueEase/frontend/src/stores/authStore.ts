/**
 * QueueEase V2 — Auth Store (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  firebaseLogin: (idToken: string, role?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'patient' | 'doctor' | 'receptionist';
  specialization?: string;
  medicalLicenseNo?: string;
  clinicId?: string;
  employeeId?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: { name: string; phone: string; relationship: string };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data.data;
          localStorage.setItem('queueease_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },
      
      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', data);
          const { token, user } = response.data.data;
          localStorage.setItem('queueease_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Registration failed');
        }
      },
      
      firebaseLogin: async (idToken, role = 'patient') => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/firebase', { idToken, role });
          const { token, user } = response.data.data;
          localStorage.setItem('queueease_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Firebase auth failed');
        }
      },
      
      logout: () => {
        localStorage.removeItem('queueease_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      updateProfile: async (data) => {
        try {
          const response = await api.put('/auth/me', data);
          set({ user: response.data.data });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Profile update failed');
        }
      },
      
      setUser: (user) => set({ user }),
    }),
    {
      name: 'queueease-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
