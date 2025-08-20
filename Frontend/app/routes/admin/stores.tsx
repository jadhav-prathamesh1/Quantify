import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApiService } from '../../services/admin-api';
import type { Store } from '../../services/admin-api';
import { useAuth } from '../../providers/AuthProvider';
import toast from 'react-hot-toast';

export default function AdminStores() {
  // ALL hooks must be called first, before any conditional logic
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // Check if user has admin role
    if (!authLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Don't render if not admin (will redirect)
  if (user.role !== 'ADMIN') {
    return null;
  }

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await adminApiService.getStores({ limit: 100 });
        setStores(response.data);
        console.log('Stores data from API:', response.data);
      } catch (apiError) {
        // If API fails (likely auth issue), show demo data with a message
        console.log('API call failed, showing demo stores:', apiError);
        
        const demoStores: Store[] = [
          {
            id: 1,
            name: "Downtown Electronics Store",
            email: "contact@downtownelectronics.com",
            address: "123 Main Street, Downtown City",
            description: "Electronics and gadgets store",
            phone: "+1-555-0123",
            status: "ACTIVE",
            ownerId: 2,
            owner: {
              id: 2,
              name: "Jane Smith Store Owner",
              email: "jane@store.com"
            },
            averageRating: 4.5,
            totalRatings: 156,
            createdAt: "2025-01-10T10:00:00Z"
          },
          {
            id: 2,
            name: "Cozy Coffee Corner",
            email: "hello@cozycoffee.com", 
            address: "456 Oak Avenue, Suburb Town",
            description: "Local coffee shop with fresh pastries",
            phone: "+1-555-0456",
            status: "ACTIVE",
            ownerId: 2,
            owner: {
              id: 2,
              name: "Jane Smith Store Owner",
              email: "jane@store.com"
            },
            averageRating: 4.8,
            totalRatings: 89,
            createdAt: "2025-01-15T14:30:00Z"
          }
        ];
        
        setStores(demoStores);
        setError('⚠️ Backend connection failed. Showing demo data. Please login as admin and ensure backend server is running on port 3001.');
      }
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      setError('Failed to load stores from database');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Store Management</h1>
            <p className="text-purple-100">Manage stores and monitor performance</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stores from Database</h3>
            
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2">Loading stores from database...</span>
              </div>
            )}

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Backend Connection Issue
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">{error}</p>
                    <div className="text-sm text-yellow-700 mt-2">
                      <p className="font-medium">To connect to real database:</p>
                      <ol className="list-decimal ml-4 mt-1">
                        <li>Start the backend server: <code className="bg-yellow-100 px-1 rounded">npm run start:dev</code></li>
                        <li>Login with an admin account</li>
                        <li>Refresh this page</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && stores.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-500">No stores found in the database.</p>
              </div>
            )}

            {!loading && !error && stores.length > 0 && (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">✅ Successfully loaded {stores.length} stores from database!</p>
                {stores.map((store) => (
                  <div key={store.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{store.name}</h4>
                        <p className="text-sm text-gray-600">Email: {store.email}</p>
                        <p className="text-sm text-gray-600">Address: {store.address}</p>
                        <p className="text-sm text-gray-600">
                          Owner: {store.owner ? store.owner.name : 'No owner assigned'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">ID: {store.id}</p>
                        <p className="text-sm text-gray-500">
                          Rating: {store.averageRating?.toFixed(1) || '0.0'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Reviews: {store.totalRatings || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
