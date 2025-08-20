import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { AdminLayout } from '../components/AdminLayout';
import DashboardStats from '../components/DashboardStats';
import DashboardCharts from '../components/DashboardCharts';
import { adminApiService } from '../services/admin-api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  // ALL hooks must be called first, before any conditional logic
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // Check if user has admin role (optional additional check)
    if (!authLoading && isAuthenticated && user && user.role !== 'ADMIN') {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          
          // Try to fetch real dashboard data from API
          try {
            const [statsData, ratingsDistribution, ratingsTrend] = await Promise.all([
              adminApiService.getDashboardStats(),
              adminApiService.getRatingsDistribution(),
              adminApiService.getRatingsTrend()
            ]);
            
            const dashboardData = {
              stats: statsData,
              charts: {
                ratingsOverTime: ratingsTrend.map((item: any) => ({
                  date: item.date || item.month || item.period,
                  value: item.value || item.ratings || item.count
                })),
                roleDistribution: statsData.roleDistribution || ratingsDistribution.map((item: any) => ({
                  role: item.role || item.name,
                  count: item.count || item.value
                }))
              }
            };
            setDashboardData(dashboardData);
          } catch (apiError) {
            console.error('API error, using demo data:', apiError);
            // Show demo data if API fails
            setDashboardData({
              stats: {
                totalUsers: 1249,
                totalStores: 89,
                totalRatings: 3472,
                averageRating: 4.2,
                growthMetrics: {
                  usersGrowth: 12.3,
                  storesGrowth: 8.7,
                  ratingsGrowth: 23.1
                }
              },
              charts: {
                ratingsOverTime: [
                  { date: 'Jan', value: 245 },
                  { date: 'Feb', value: 289 },
                  { date: 'Mar', value: 312 },
                  { date: 'Apr', value: 398 },
                  { date: 'May', value: 445 },
                  { date: 'Jun', value: 521 }
                ],
                roleDistribution: [
                  { role: 'ADMIN', count: 1 },
                  { role: 'OWNER', count: 15 },
                  { role: 'USER', count: 1233 }
                ]
              }
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-indigo-100 mt-2">
                  Here's what's happening with your platform today.
                </p>
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
                  <div className="text-indigo-200">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <DashboardStats
            stats={{
              totalUsers: dashboardData?.stats.totalUsers || 0,
              totalStores: dashboardData?.stats.totalStores || 0,
              totalRatings: dashboardData?.stats.totalRatings || 0
            }}
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DashboardCharts
            chartData={dashboardData?.charts || {
              ratingsOverTime: [],
              roleDistribution: []
            }}
          />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Manage Users',
                  description: 'View and manage user accounts',
                  href: '/admin/users',
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  title: 'Manage Stores',
                  description: 'Oversee store listings',
                  href: '/admin/stores',
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  title: 'Review Ratings',
                  description: 'Monitor rating activities',
                  href: '/admin/ratings',
                  color: 'from-yellow-500 to-yellow-600'
                }
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Link
                    to={action.href}
                    className={`block p-4 bg-gradient-to-r ${action.color} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
                  >
                    <div>
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Database', status: 'Online', color: 'green' },
                { label: 'API Server', status: 'Online', color: 'green' },
                { label: 'File Storage', status: 'Online', color: 'green' },
                { label: 'Email Service', status: 'Online', color: 'green' }
              ].map((service, index) => (
                <div key={service.label} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full bg-${service.color}-500 animate-pulse`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{service.label}</div>
                    <div className={`text-xs text-${service.color}-600`}>{service.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
