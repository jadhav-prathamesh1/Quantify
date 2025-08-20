import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { getUserReviews, updateReview, deleteReview } from '../services/user.api';
import ReviewsTable from '../components/ReviewsTable';
import ReviewForm from '../components/ReviewForm';

interface Review {
  id: number;
  rating: number;
  comment: string;
  storeName: string;
  storeCategory: string;
  createdAt: string;
}

interface ReviewsData {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UserReviewsProps {
  userId: number;
}

export default function UserReviews({ userId }: UserReviewsProps) {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    sort: 'createdAt',
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const result = await getUserReviews(userId, {
          search: filters.search || undefined,
          rating: filters.rating ? parseInt(filters.rating) : undefined,
          sort: filters.sort,
          page: filters.page,
          limit: filters.limit,
        });
        setData(result);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Reviews fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId, filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value as string)),
    }));
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
  };

  const handleUpdateReview = async (reviewData: { rating: number; comment?: string }) => {
    if (!editingReview) return;

    try {
      await updateReview(editingReview.id, reviewData);
      setEditingReview(null);
      // Refresh reviews
      const result = await getUserReviews(userId, {
        search: filters.search || undefined,
        rating: filters.rating ? parseInt(filters.rating) : undefined,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
      });
      setData(result);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId);
      // Refresh reviews
      const result = await getUserReviews(userId, {
        search: filters.search || undefined,
        rating: filters.rating ? parseInt(filters.rating) : undefined,
        sort: filters.sort,
        page: filters.page,
        limit: filters.limit,
      });
      setData(result);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Most Recent' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rating' },
    { value: 'rating_asc', label: 'Lowest Rating' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Reviews 📝
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and edit your store reviews
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews by store name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Header */}
        {data && (
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              Showing {data.reviews.length} of {data.pagination.total} reviews
            </div>
            <a
              href="/user/stores"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Write New Review
            </a>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg font-semibold mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Reviews Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ReviewsTable
            reviews={data?.reviews || []}
            loading={loading}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </motion.div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center space-x-2 mt-8"
          >
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {[...Array(data.pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handleFilterChange('page', i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  filters.page === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => handleFilterChange('page', Math.min(data.pagination.pages, filters.page + 1))}
              disabled={filters.page === data.pagination.pages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </motion.div>
        )}

        {/* Edit Review Modal */}
        {editingReview && (
          <ReviewForm
            storeId={0} // Not needed for editing
            initialData={{
              rating: editingReview.rating,
              comment: editingReview.comment,
            }}
            isEditing={true}
            onSuccess={(reviewData) => {
              if (reviewData) {
                handleUpdateReview(reviewData);
              }
            }}
            onClose={() => setEditingReview(null)}
          />
        )}
      </div>
    </div>
  );
}
