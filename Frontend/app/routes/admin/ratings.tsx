import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { adminApiService } from '../../services/admin-api';
import type { Rating } from '../../services/admin-api';
import { useAuth } from '../../providers/AuthProvider';
import { toast } from 'react-hot-toast';

export default function AdminRatings() {
  const { user, isAuthenticated, loading } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication first
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        window.location.href = '/auth/login';
        return;
      }
      if (user?.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.');
        window.location.href = '/';
        return;
      }
    }
  }, [isAuthenticated, loading, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchRatings();
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">Redirecting...</p>
        </div>
      </div>
    );
  }

  const fetchRatings = async () => {
    try {
      setDataLoading(true);
      setError(null);
      
      // Try to fetch from API first
      try {
        const response = await adminApiService.getRatings({ limit: 100 });
        setRatings(response.data);
        console.log('Ratings data from API:', response.data);
      } catch (apiError) {
        // If API fails (likely auth issue), show demo data with a message
        console.log('API call failed, showing demo ratings:', apiError);
        
        const demoRatings: Rating[] = [
          {
            id: 1,
            rating: 5,
            comment: "Excellent service and great products!",
            createdAt: "2025-01-20T10:30:00Z",
            user: {
              id: 3,
              name: "Bob Johnson Regular User",
              email: "bob@user.com"
            },
            store: {
              id: 1,
              name: "Downtown Electronics Store",
              email: "contact@downtownelectronics.com",
              address: "123 Main Street, Downtown City"
            }
          },
          {
            id: 2,
            rating: 4,
            comment: "Good coffee, friendly staff. Could use more variety in pastries.",
            createdAt: "2025-01-22T15:45:00Z",
            user: {
              id: 3,
              name: "Bob Johnson Regular User", 
              email: "bob@user.com"
            },
            store: {
              id: 2,
              name: "Cozy Coffee Corner",
              email: "hello@cozycoffee.com",
              address: "456 Oak Avenue, Suburb Town"
            }
          },
          {
            id: 3,
            rating: 5,
            comment: "Amazing atmosphere and the best latte in town!",
            createdAt: "2025-01-25T09:15:00Z",
            user: {
              id: 1,
              name: "John Doe Administrator",
              email: "john@admin.com"
            },
            store: {
              id: 2,
              name: "Cozy Coffee Corner",
              email: "hello@cozycoffee.com", 
              address: "456 Oak Avenue, Suburb Town"
            }
          }
        ];
        
        setRatings(demoRatings);
        setError('⚠️ Backend connection failed. Showing demo data. Please login as admin and ensure backend server is running on port 3001.');
      }
    } catch (error: any) {
      console.error('Failed to fetch ratings:', error);
      setError('Failed to load ratings from database');
      setRatings([]);
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Rating Management</h1>
            <p className="text-purple-100">Monitor ratings and customer feedback</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings from Database</h3>
            
            {dataLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2">Loading ratings from database...</span>
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

            {!dataLoading && !error && ratings.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings found</h3>
                <p className="text-gray-500">No ratings found in the database.</p>
              </div>
            )}

            {!dataLoading && !error && ratings.length > 0 && (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">✅ Successfully loaded {ratings.length} ratings from database!</p>
                {ratings.map((rating) => (
                  <div key={rating.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 text-sm font-medium">{rating.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          User: {rating.user ? rating.user.name : 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Store: {rating.store ? rating.store.name : 'Unknown store'}
                        </p>
                        {rating.comment && (
                          <p className="text-sm text-gray-800 mt-2 italic">"{rating.comment}"</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-500">ID: {rating.id}</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(rating.createdAt).toLocaleDateString()}
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
