import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  category?: string;
  phone?: string;
  ownerId: number;
  createdAt: string;
  averageRating?: string;
  totalReviews?: number;
}

export interface DashboardStats {
  totalStores: number;
  averageRating: number;
  totalReviews: number;
  status: string;
  canAddStore: boolean;
  maxStoresReached: boolean;
  storeLimit?: number;
  stores: Array<{
    id: number;
    name: string;
    averageRating: string;
    totalReviews: number;
  }>;
}

export interface StoreInsights {
  store: {
    id: number;
    name: string;
    totalRatings: number;
    averageRating: string;
  };
  ratingsDistribution: Array<{
    rating: number;
    count: number;
  }>;
  ratingsTrend: Array<{
    month: string;
    averageRating: string;
    count: number;
  }>;
  topReviewers: Array<{
    userId: number;
    name: string;
    ratingsCount: number;
    averageRating: number;
  }>;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  store: {
    id: number;
    name: string;
  };
}

export interface OwnerProfile {
  id: number;
  name: string;
  email: string;
  address?: string;
  role: string;
  status: string;
  createdAt: string;
  ownedStores: Array<{
    id: number;
    name: string;
  }>;
}

export interface CreateStoreDto {
  name: string;
  email: string;
  address: string;
  category?: string;
  phone?: string;
}

export interface UpdateStoreDto {
  name?: string;
  email?: string;
  address?: string;
  category?: string;
  phone?: string;
}

export interface UpdateOwnerDto {
  name?: string;
  email?: string;
  address?: string;
  currentPassword?: string;
  password?: string;
}

class OwnerApiService {
  // Dashboard
  async getDashboardStats(ownerId: number): Promise<DashboardStats> {
    const response = await api.get(`/api/owner/dashboard/${ownerId}`);
    return response.data;
  }

  // Dashboard Charts Data
  async getDashboardCharts(ownerId: number): Promise<{
    reviewsOverTime: Array<{ date: string; value: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
    storePerformance: Array<{ store: string; rating: number; reviews: number }>;
  }> {
    const response = await api.get(`/api/owner/dashboard/${ownerId}/charts`);
    return response.data;
  }

  // Stores
  async getOwnerStores(ownerId: number, params?: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    stores: Store[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(`/api/owner/shops/${ownerId}`, { params });
    return response.data;
  }

  async createStore(ownerId: number, storeData: CreateStoreDto): Promise<Store> {
    const response = await api.post(`/api/owner/shops?ownerId=${ownerId}`, storeData);
    return response.data;
  }

  async updateStore(ownerId: number, storeId: number, storeData: UpdateStoreDto): Promise<Store> {
    const response = await api.patch(`/api/owner/shops/${storeId}?ownerId=${ownerId}`, storeData);
    return response.data;
  }

  async deleteStore(ownerId: number, storeId: number): Promise<void> {
    await api.delete(`/api/owner/shops/${storeId}?ownerId=${ownerId}`);
  }

  // Insights
  async getStoreInsights(ownerId: number, shopId: number): Promise<StoreInsights> {
    const response = await api.get(`/api/owner/insights/${shopId}?ownerId=${ownerId}`);
    return response.data;
  }

  async getTopReviewers(ownerId: number, shopId: number): Promise<{
    topReviewers: StoreInsights['topReviewers'];
  }> {
    const response = await api.get(`/api/owner/insights/${shopId}/reviewers?ownerId=${ownerId}`);
    return response.data;
  }

  // Reviews
  async getOwnerReviews(ownerId: number, params?: {
    storeId?: number;
    search?: string;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get(`/api/owner/reviews/${ownerId}`, { params });
    return response.data;
  }

  async flagReview(ownerId: number, reviewId: number, reason: string): Promise<Review> {
    const response = await api.patch(`/api/owner/reviews/${reviewId}/flag?ownerId=${ownerId}`, { reason });
    return response.data;
  }

  // Profile
  async getOwnerProfile(ownerId: number): Promise<OwnerProfile> {
    const response = await api.get(`/api/owner/profile/${ownerId}`);
    return response.data;
  }

  async updateOwnerProfile(ownerId: number, profileData: UpdateOwnerDto): Promise<OwnerProfile> {
    const response = await api.patch(`/api/owner/profile/${ownerId}`, profileData);
    return response.data;
  }
}

export const ownerApiService = new OwnerApiService();
