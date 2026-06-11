import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';
import { apiGet, apiPost } from '../services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  role: UserRole | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    clinicId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      role: null,

      initialize: async () => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            const response = await apiGet<User>('/auth/me');
            if (response.data) {
              set({
                user: response.data,
                token,
                isAuthenticated: true,
                role: response.data.role,
                isInitialized: true,
              });
              return;
            }
          }
        } catch {
          await AsyncStorage.removeItem('authToken');
        }
        set({ isInitialized: true });
      },

      login: async (email, password) => {
        const response = await apiPost<{ user: User; token: string }>('/auth/login', {
          email, password,
        });
        if (!response.data) throw new Error(response.error || 'Login failed');
        const { user, token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true, role: user.role });
      },

      register: async (data) => {
        const response = await apiPost<{ user: User; token: string }>('/auth/register', data);
        if (!response.data) throw new Error(response.error || 'Registration failed');
        const { user, token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true, role: user.role });
      },

      logout: async () => {
        try { await apiPost('/auth/logout', {}); } catch {}
        await AsyncStorage.removeItem('authToken');
        set({ user: null, token: null, isAuthenticated: false, role: null });
      },

      setUser: (user) => set({ user }),

      updateProfile: async (data) => {
        const response = await apiPost<User>('/auth/profile', data);
        if (!response.data) throw new Error('Update failed');
        set({ user: response.data });
        return response.data;
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: async (name) => {
          try {
            const item = await AsyncStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          } catch { return null; }
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
