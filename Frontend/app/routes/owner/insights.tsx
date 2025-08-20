import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  StarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../providers/AuthProvider';
import { OwnerLayout } from '../../components/OwnerLayout';
import { useStoreCount } from '../../hooks/useStoreCount';
import { ownerApiService, type Store, type StoreInsights, type Review } from '../../features/owner/services/owner.api';
import toast from 'react-hot-toast';

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, changeLabel, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(change)}% {changeLabel || 'vs last month'}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function OwnerInsights() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { storeCount, storeLimit } = useStoreCount();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [insights, setInsights] = useState<StoreInsights | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for storeId in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    if (storeId && stores.length > 0) {
      const store = stores.find(s => s.id === parseInt(storeId));
      if (store) {
        setSelectedStore(store);
      }
    }
  }, [stores]);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!authLoading && isAuthenticated && user && user.role !== 'OWNER') {
      toast.error('Access denied. Store owner privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  // Fetch stores data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'OWNER' && user.id) {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  // Fetch insights when store is selected
  useEffect(() => {
    if (selectedStore) {
      fetchStoreInsights(selectedStore.id);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const storesData = await ownerApiService.getOwnerStores(user.id, { limit: 10 });
      setStores(storesData.stores);
      
      // Auto-select first store if no selection
      if (storesData.stores.length > 0 && !selectedStore) {
        setSelectedStore(storesData.stores[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInsights = async (storeId: number) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const insightsData = await ownerApiService.getStoreInsights(user.id, storeId);
      setInsights(insightsData);
    } catch (error: any) {
      console.error('Failed to fetch insights:', error);
      toast.error('Failed to load store insights');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated or not owner
  if (!isAuthenticated || !user || user.role !== 'OWNER') {
    return null;
  }

  // If user account is pending
  if (user.status === 'PENDING') {
    return (
      <OwnerLayout storeCount={storeCount} storeLimit={storeLimit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Your analytics dashboard will be available once your account is approved by our admin team.
            </p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  return (
    <OwnerLayout storeCount={storeCount} storeLimit={storeLimit}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>
            <p className="text-gray-600">Detailed insights and performance metrics for your stores</p>
          </div>
          
          {/* Store Selector */}
          {stores.length > 1 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Store:</label>
              <select
                value={selectedStore?.id || ''}
                onChange={(e) => {
                  const store = stores.find(s => s.id === parseInt(e.target.value));
                  setSelectedStore(store || null);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Data Privacy Notice */}
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-start">
            <ChartBarIcon className="w-5 h-5 text-purple-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-purple-800">Analytics & Data Privacy</h4>
              <p className="text-sm text-purple-700 mt-1">
                All analytics, insights, and performance metrics displayed are exclusively for stores that belong to your account. You cannot view or access analytics data from other store owners.
              </p>
            </div>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores to analyze</h3>
            <p className="text-gray-600 mb-6">
              Create your first store to start tracking performance metrics and customer insights.
            </p>
            <button
              onClick={() => window.location.href = '/owner/shops'}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700"
            >
              Manage Stores
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Selected Store Header */}
            {selectedStore && (
              <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{selectedStore.name}</h2>
                    <p className="text-purple-100">{selectedStore.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {selectedStore.averageRating ? parseFloat(selectedStore.averageRating).toFixed(1) : '0.0'} ⭐
                    </div>
                    <div className="text-purple-200">
                      {selectedStore.totalReviews || 0} reviews
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Cards */}
            {insights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <MetricCard
                    title="Total Reviews"
                    value={insights.store.totalRatings}
                    icon={StarIcon}
                    color="bg-yellow-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MetricCard
                    title="Average Rating"
                    value={`${parseFloat(insights.store.averageRating).toFixed(1)} ⭐`}
                    icon={ArrowTrendingUpIcon}
                    color="bg-green-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MetricCard
                    title="Top Reviewers"
                    value={insights.topReviewers.length}
                    icon={UsersIcon}
                    color="bg-blue-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <MetricCard
                    title="Trend Data Points"
                    value={insights.ratingsTrend.length}
                    icon={CalendarIcon}
                    color="bg-purple-500"
                  />
                </motion.div>
              </div>
            )}

            {/* Charts Section */}
            {insights && (
              <>
                {/* Reviews Over Time */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Ratings Trend Over Time</h3>
                  <div className="h-80">
                    {insights.ratingsTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={insights.ratingsTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="month" className="text-gray-600" />
                          <YAxis className="text-gray-600" />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="averageRating" 
                            stroke="#8B5CF6"
                            fill="url(#reviewsGradient)"
                            strokeWidth={2}
                          />
                          <defs>
                            <linearGradient id="reviewsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">No trend data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Rating Distribution and Top Reviewers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Rating Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
                    <div className="h-64">
                      {insights.ratingsDistribution.some((d: any) => d.count > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={insights.ratingsDistribution.filter((d: any) => d.count > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="count"
                              label={(entry: any) => `${entry.rating}⭐ (${entry.count})`}
                            >
                              {insights.ratingsDistribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <StarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No ratings yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Top Reviewers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Reviewers</h3>
                    <div className="space-y-4">
                      {insights.topReviewers.length > 0 ? (
                        insights.topReviewers.map((reviewer, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {reviewer.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{reviewer.name}</p>
                                <p className="text-xs text-gray-500">User ID: {reviewer.userId}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {reviewer.ratingsCount} ratings
                              </p>
                              <p className="text-xs text-gray-500">
                                Avg: {reviewer.averageRating.toFixed(1)}⭐
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <UsersIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">No reviewers yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white text-center"
                >
                  <h3 className="text-lg font-semibold mb-2">Want to see more detailed reviews?</h3>
                  <p className="text-purple-100 mb-4">
                    Manage and respond to customer reviews for {selectedStore?.name}
                  </p>
                  <button
                    onClick={() => window.location.href = `/owner/reviews?storeId=${selectedStore?.id}`}
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    View All Reviews →
                  </button>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
