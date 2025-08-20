const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'OWNER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  ownedStores?: Store[];
  ratings?: Rating[];
}

export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  description?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  ownerId: number;
  owner: {
    id: number;
    name: string;
    email: string;
  };
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

export interface Rating {
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
    email: string;
    address: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  ratingsTrend: Array<{ date: string; value: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AdminApiService {
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async fetchWithCredentials(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
    return response;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  }

  async getRatingsDistribution() {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/distribution`);
    if (!response.ok) throw new Error('Failed to fetch ratings distribution');
    return response.json();
  }

  async getRatingsTrend() {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/trend`);
    if (!response.ok) throw new Error('Failed to fetch ratings trend');
    return response.json();
  }

  // Users API
  async getUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/users?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async getUser(id: number): Promise<User> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }

  async createUser(user: {
    name: string;
    email: string;
    password: string;
    address: string;
    role: 'ADMIN' | 'USER' | 'OWNER';
  }): Promise<User> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }

  async updateUser(id: number, user: {
    name?: string;
    email?: string;
    address?: string;
    role?: 'ADMIN' | 'USER' | 'OWNER';
    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  }): Promise<User> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }

  async deleteUser(id: number): Promise<void> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete user');
  }

  // Stores API
  async getStores(params: {
    search?: string;
    status?: string;
    ownerId?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<Store[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch stores');
    return response.json();
  }

  async getStore(id: number): Promise<Store> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores/${id}`);
    if (!response.ok) throw new Error('Failed to fetch store');
    return response.json();
  }

  async createStore(store: {
    name: string;
    email: string;
    address: string;
    description?: string;
    phone?: string;
  }, ownerId: number): Promise<Store> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores?ownerId=${ownerId}`, {
      method: 'POST',
      body: JSON.stringify(store),
    });
    if (!response.ok) throw new Error('Failed to create store');
    return response.json();
  }

  async updateStore(id: number, store: {
    name?: string;
    email?: string;
    address?: string;
    description?: string;
    phone?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  }): Promise<Store> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(store),
    });
    if (!response.ok) throw new Error('Failed to update store');
    return response.json();
  }

  async deleteStore(id: number): Promise<void> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete store');
  }

  async assignOwner(storeId: number, ownerId: number): Promise<Store> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/stores/${storeId}/assign-owner`, {
      method: 'PATCH',
      body: JSON.stringify({ ownerId }),
    });
    if (!response.ok) throw new Error('Failed to assign owner');
    return response.json();
  }

  // Ratings API
  async getRatings(params: {
    search?: string;
    storeId?: number;
    userId?: number;
    rating?: number;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<Rating[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch ratings');
    return response.json();
  }

  async getRating(id: number): Promise<Rating> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/${id}`);
    if (!response.ok) throw new Error('Failed to fetch rating');
    return response.json();
  }

  async createRating(rating: {
    rating: number;
    comment?: string;
  }, userId: number, storeId: number): Promise<Rating> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings?userId=${userId}&storeId=${storeId}`, {
      method: 'POST',
      body: JSON.stringify(rating),
    });
    if (!response.ok) throw new Error('Failed to create rating');
    return response.json();
  }

  async updateRating(id: number, rating: {
    rating?: number;
    comment?: string;
  }): Promise<Rating> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(rating),
    });
    if (!response.ok) throw new Error('Failed to update rating');
    return response.json();
  }

  async deleteRating(id: number): Promise<void> {
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete rating');
  }

  async getRatingsAnalytics(storeId?: number) {
    const searchParams = storeId ? `?storeId=${storeId}` : '';
    const response = await this.fetchWithCredentials(`${API_BASE_URL}/api/admin/ratings/analytics${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch ratings analytics');
    return response.json();
  }
}

export const adminApiService = new AdminApiService();
