import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StarIcon, UserIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { getUserDashboard } from '../services/user.api';

interface DashboardStats {
  averageRatingGiven: number;
  totalReviewsSubmitted: number;
  storesRated: number;
}

interface UserDashboardData {
  user: {
    name: string;
    email: string;
  };
  stats: DashboardStats;
}

interface UserDashboardProps {
  userId: number;
}

export default function UserDashboard({ userId }: UserDashboardProps) {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const result = await getUserDashboard(userId);
        setData(result);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {data?.user.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your review activity overview
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Average Rating Given
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats.averageRatingGiven.toFixed(1)}
                </p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(data?.stats.averageRatingGiven || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <StarIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Total Reviews
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats.totalReviewsSubmitted}
                </p>
                <p className="text-green-600 text-sm mt-2">
                  Reviews submitted
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                  Stores Rated
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {data?.stats.storesRated}
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  Unique stores
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.a
              href="/user/stores"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
            >
              <BuildingStorefrontIcon className="h-6 w-6 mr-3" />
              <span className="font-semibold">Discover Stores</span>
            </motion.a>

            <motion.a
              href="/user/reviews"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300"
            >
              <StarIcon className="h-6 w-6 mr-3" />
              <span className="font-semibold">My Reviews</span>
            </motion.a>

            <motion.a
              href="/user/profile"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
            >
              <UserIcon className="h-6 w-6 mr-3" />
              <span className="font-semibold">My Profile</span>
            </motion.a>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center p-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg"
            >
              <StarIcon className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold text-sm">Your Impact</div>
                <div className="text-xs opacity-90">{data?.stats.totalReviewsSubmitted} reviews shared</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
