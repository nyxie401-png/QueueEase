import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ApiError } from '../types';
import Toast from './toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          // Redirect to login (handled in navigation)
        }
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data = {}, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse<any> {
    const axiosError = error as AxiosError;
    const message = axiosError.response?.data?.message || 
                   axiosError.message || 
                   'An error occurred';

    console.error('API Error:', message);
    Toast.error(message);

    return {
      success: false,
      error: message,
      message: message,
    };
  }
}

export const apiService = new ApiService();
export const apiGet = <T,>(url: string, config?: any) => apiService.get<T>(url, config);
export const apiPost = <T,>(url: string, data?: any, config?: any) => apiService.post<T>(url, data, config);
export const apiPut = <T,>(url: string, data?: any, config?: any) => apiService.put<T>(url, data, config);
export const apiDelete = <T,>(url: string, config?: any) => apiService.delete<T>(url, config);