import axios from 'axios';
import type { SignupFormData, LoginFormData } from '../../../utils/validation';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response types
export interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Auth API methods
export const authApi = {
  // Signup user
  signup: async (data: SignupFormData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/signup', data);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Signup failed',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  // Login user
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/login', data);
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Login failed',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post('/api/logout');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Logout failed',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get('/api/me');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Failed to get profile',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  // Test role-based endpoints
  getAdminDashboard: async (): Promise<any> => {
    try {
      const response = await api.get('/api/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Access denied',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  getOwnerDashboard: async (): Promise<any> => {
    try {
      const response = await api.get('/api/owner/dashboard');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Access denied',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },

  getUserDashboard: async (): Promise<any> => {
    try {
      const response = await api.get('/api/user/dashboard');
      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Access denied',
        statusCode: error.response?.status,
      } as ApiError;
    }
  },
};
