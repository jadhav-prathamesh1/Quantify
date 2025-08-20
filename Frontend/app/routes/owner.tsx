import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BuildingStorefrontIcon, 
  PlusIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../providers/AuthProvider';
import { OwnerLayout } from '../components/OwnerLayout';
import OwnerDashboardStats from '../components/OwnerDashboardStats';
import OwnerDashboardCharts from '../components/OwnerDashboardCharts';
import { ownerApiService, type DashboardStats } from '../features/owner/services/owner.api';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{
    reviewsOverTime: Array<{ date: string; value: number }>;
    ratingDistribution: Array<{ rating: number; count: number }>;
    storePerformance: Array<{ store: string; rating: number; reviews: number }>;
  }>({
    reviewsOverTime: [],
    ratingDistribution: [],
    storePerformance: []
  });
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // Check if user has owner role
    if (!authLoading && isAuthenticated && user && user.role !== 'OWNER') {
      toast.error('Access denied. Store owner privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'OWNER' && user.id) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          
          // Try to fetch real dashboard data from API
          try {
            const [dashboardStats, charts] = await Promise.all([
              ownerApiService.getDashboardStats(user.id),
              ownerApiService.getDashboardCharts(user.id)
            ]);
            
            setDashboardData(dashboardStats);
            setChartData(charts);
          } catch (apiError) {
            console.error('API error, using fallback data:', apiError);
            // Show fallback data if API fails
            setDashboardData({
              totalStores: 0,
              totalReviews: 0,
              averageRating: 0,
              status: 'PENDING',
              canAddStore: true,
              maxStoresReached: false,
              storeLimit: 2,
              stores: []
            });
            setChartData({
              reviewsOverTime: [],
              ratingDistribution: [],
              storePerformance: []
            });
          }
        } catch (error) {
          console.error('Error in fetchDashboardData:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      };
      
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Don't render if not owner (will redirect)
  if (user.role !== 'OWNER') {
    return null;
  }

  return (
    <OwnerLayout storeCount={dashboardData?.totalStores || 0} storeLimit={dashboardData?.storeLimit || 2}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-purple-100 mt-2">
                  {user?.status === 'PENDING' 
                    ? "Your account is awaiting admin approval. You'll have full access once approved."
                    : "Here's an overview of your store performance today."
                  }
                </p>
                {user?.status === 'PENDING' && (
                  <div className="mt-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    🕐 Pending Approval
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-purple-200">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Stats */}
        {dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <OwnerDashboardStats
              stats={{
                totalStores: dashboardData.totalStores,
                totalReviews: dashboardData.totalReviews,
                averageRating: dashboardData.averageRating,
                storeLimit: dashboardData.storeLimit || 2
              }}
            />
          </motion.div>
        )}

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <OwnerDashboardCharts chartData={chartData} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Manage Stores',
                  description: 'Add, edit, and manage your stores',
                  href: '/owner/shops',
                  color: 'from-purple-500 to-purple-600',
                  icon: BuildingStorefrontIcon,
                  disabled: user?.status === 'PENDING'
                },
                {
                  title: 'View Analytics',
                  description: 'Detailed performance insights',
                  href: '/owner/insights',
                  color: 'from-green-500 to-green-600',
                  icon: ChartBarIcon,
                  disabled: user?.status === 'PENDING'
                },
                {
                  title: 'Customer Reviews',
                  description: 'Manage customer feedback',
                  href: '/owner/reviews',
                  color: 'from-yellow-500 to-yellow-600',
                  icon: ChatBubbleBottomCenterTextIcon,
                  disabled: user?.status === 'PENDING'
                },
                {
                  title: 'Profile Settings',
                  description: 'Update your account details',
                  href: '/owner/profile',
                  color: 'from-indigo-500 to-indigo-600',
                  icon: UserIcon,
                  disabled: false
                }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: action.disabled ? 1 : 1.02, y: action.disabled ? 0 : -2 }}
                  >
                    <button
                      onClick={() => !action.disabled && (window.location.href = action.href)}
                      disabled={action.disabled}
                      className={`${
                        action.disabled 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : `bg-gradient-to-r ${action.color} text-white hover:shadow-lg`
                      } block p-4 rounded-lg transition-all duration-300 w-full text-left relative`}
                    >
                      <div className="flex items-center mb-2">
                        <Icon className="w-6 h-6 mr-2" />
                        {action.disabled && (
                          <div className="ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                      {action.disabled && (
                        <p className="text-xs mt-1 opacity-75">Available after approval</p>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Store Management CTA */}
        {user?.status === 'ACTIVE' && dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ready to grow your business?</h3>
                  <p className="text-gray-600 mt-1">
                    {dashboardData.totalStores === 0 
                      ? "Add your first store to start receiving customer reviews and build your online presence."
                      : `You have ${dashboardData.totalStores}/${dashboardData.storeLimit || 2} stores. ${dashboardData.canAddStore ? 'Add another store to expand your reach.' : 'You\'ve reached the maximum number of stores.'}`
                    }
                  </p>
                </div>
                {dashboardData.canAddStore && (
                  <button
                    onClick={() => window.location.href = '/owner/shops?add=true'}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add New Store
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Getting Started Guide for Pending Users */}
        {user?.status === 'PENDING' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">🚀 Getting Ready for Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">1️⃣</span>
                  </div>
                  <h4 className="font-medium text-yellow-900">Account Review</h4>
                  <p className="text-sm text-yellow-700 mt-1">Our admin team is reviewing your store owner application</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">2️⃣</span>
                  </div>
                  <h4 className="font-medium text-yellow-900">Approval Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">You'll receive an email when your account is approved</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl">3️⃣</span>
                  </div>
                  <h4 className="font-medium text-yellow-900">Start Managing</h4>
                  <p className="text-sm text-yellow-700 mt-1">Add up to 2 stores and begin collecting reviews</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </OwnerLayout>
  );
}
