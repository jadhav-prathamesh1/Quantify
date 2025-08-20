import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api`;

// Create axios instance with default config
const userApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add request interceptor to include authorization header
userApi.interceptors.request.use(
  (config) => {
    // Get token from cookies or localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
userApi.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      console.warn('Authentication required - redirecting to login');
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Dashboard
export const getUserDashboard = async (userId: number) => {
  const response = await userApi.get(`/user/dashboard/${userId}`);
  return response.data;
};

// Stores
export const getAllStores = async (params?: {
  search?: string;
  category?: string;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await userApi.get('/user/stores', { params });
  return response.data;
};

export const getStore = async (storeId: number) => {
  const response = await userApi.get(`/user/stores/${storeId}`);
  return response.data;
};

export const getStoreReviews = async (storeId: number, params?: { page?: number; limit?: number }) => {
  const response = await userApi.get(`/user/stores/${storeId}/reviews`, { params });
  return response.data;
};

export const addReview = async (storeId: number, review: { rating: number; comment?: string }) => {
  const response = await userApi.post(`/user/stores/${storeId}/reviews`, review);
  return response.data;
};

// Reviews
export const getUserReviews = async (userId: number, params?: {
  search?: string;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await userApi.get(`/user/reviews/${userId}`, { params });
  return response.data;
};

export const updateReview = async (reviewId: number, review: { rating?: number; comment?: string }) => {
  const response = await userApi.patch(`/user/reviews/${reviewId}`, review);
  return response.data;
};

export const deleteReview = async (reviewId: number) => {
  const response = await userApi.delete(`/user/reviews/${reviewId}`);
  return response.data;
};

// Profile
export const getUserProfile = async (userId: number) => {
  const response = await userApi.get(`/user/profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId: number, profile: {
  name?: string;
  address?: string;
  phone?: string;
}) => {
  const response = await userApi.patch(`/user/profile/${userId}`, profile);
  return response.data;
};
