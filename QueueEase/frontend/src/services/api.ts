/**
 * QueueEase V2 — API Client
 * Axios-based API client with auth interceptors.
 */

import axios from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const csrfClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const fetchCsrfToken = async (): Promise<string | undefined> => {
  const response = await csrfClient.get<ApiResponse<{ csrfToken: string }>>('/csrf-token');
  return response.data.data?.csrfToken;
};

// Request interceptor — attach token and CSRF header for unsafe requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('queueease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = await fetchCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('queueease_token');
      localStorage.removeItem('queueease_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper for typed API calls
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  const response = await api.get<ApiResponse<T>>(url);
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data;
}

export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
}
