import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../providers/AuthProvider';
import { OwnerLayout } from '../../components/OwnerLayout';
import { useStoreCount } from '../../hooks/useStoreCount';
import { ownerApiService, type Store, type Review } from '../../features/owner/services/owner.api';
import toast from 'react-hot-toast';

interface FilterState {
  storeId: number | null;
  rating: number | null;
  search: string;
  sort: 'newest' | 'oldest' | 'rating_high' | 'rating_low';
}

export default function OwnerReviews() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { storeCount, storeLimit } = useStoreCount();
  const [stores, setStores] = useState<Store[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    storeId: null,
    rating: null,
    search: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [flaggingReview, setFlaggingReview] = useState<number | null>(null);
  const [flagModal, setFlagModal] = useState<{
    reviewId: number;
    show: boolean;
    reason: string;
  }>({
    reviewId: 0,
    show: false,
    reason: ''
  });

  // Check for storeId in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    if (storeId && parseInt(storeId)) {
      setFilters(prev => ({ ...prev, storeId: parseInt(storeId) }));
    }
  }, []);

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

  // Fetch reviews when filters change
  useEffect(() => {
    if (user?.id && stores.length > 0) {
      fetchReviews();
    }
  }, [user, stores, filters, pagination.page]);

  const fetchStores = async () => {
    if (!user?.id) return;

    try {
      const storesData = await ownerApiService.getOwnerStores(user.id, { limit: 50 });
      setStores(storesData.stores);
      
      // If no store filter is set, auto-select first store
      if (!filters.storeId && storesData.stores.length > 0) {
        setFilters(prev => ({ ...prev, storeId: storesData.stores[0].id }));
      }
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
    }
  };

  const fetchReviews = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const reviewsData = await ownerApiService.getOwnerReviews(user.id, {
        storeId: filters.storeId || undefined,
        search: filters.search || undefined,
        rating: filters.rating || undefined,
        sort: filters.sort,
        page: pagination.page,
        limit: pagination.limit
      });
      
      setReviews(reviewsData.reviews);
      setPagination(prev => ({
        ...prev,
        total: reviewsData.pagination.total,
        totalPages: reviewsData.pagination.totalPages
      }));
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagReview = async () => {
    if (!flagModal.reason.trim() || !user?.id) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    try {
      setFlaggingReview(flagModal.reviewId);
      await ownerApiService.flagReview(user.id, flagModal.reviewId, flagModal.reason);
      toast.success('Review has been flagged for admin review');
      setFlagModal({ reviewId: 0, show: false, reason: '' });
      fetchReviews(); // Refresh the reviews
    } catch (error: any) {
      console.error('Failed to flag review:', error);
      toast.error(error.response?.data?.message || 'Failed to flag review');
    } finally {
      setFlaggingReview(null);
    }
  };

  const getRatingStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
    if (rating >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
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
            <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Management Coming Soon</h3>
            <p className="text-gray-600">
              Your reviews management dashboard will be available once your account is approved.
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
            <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
            <p className="text-gray-600">Monitor and manage customer reviews for your stores</p>
          </div>
        </div>

        {/* Data Privacy Notice */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <StarIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Review Access & Privacy</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can only view and manage reviews for stores that belong to your account. All reviews, ratings, and customer feedback displayed are specific to your owned stores and cannot be accessed by other store owners.
              </p>
            </div>
          </div>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores available</h3>
            <p className="text-gray-600 mb-6">
              Create your first store to start receiving customer reviews.
            </p>
            <button
              onClick={() => window.location.href = '/owner/shops'}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700"
            >
              Manage Stores
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Store Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store
                  </label>
                  <select
                    value={filters.storeId || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      storeId: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">All Stores</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select
                    value={filters.rating || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      rating: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      sort: e.target.value as FilterState['sort']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating_high">Highest Rating</option>
                    <option value="rating_low">Lowest Rating</option>
                  </select>
                </div>

                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <StarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
                <p className="text-gray-600">
                  {filters.storeId || filters.rating || filters.search 
                    ? 'Try adjusting your filters to see more reviews.' 
                    : 'Your stores haven\'t received any reviews yet.'}
                </p>
              </div>
            ) : (
              <>
                {/* Reviews List */}
                <div className="space-y-4 mb-6">
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">
                                  {review.user.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                                <p className="text-xs text-gray-500">{review.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {getRatingStars(review.rating)}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(review.rating)}`}>
                                {review.rating} Stars
                              </span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Store:</span> {review.store.name}
                            </p>
                            {review.comment && (
                              <p className="text-gray-700">{review.comment}</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Flag Action */}
                        <div className="ml-4">
                          <button
                            onClick={() => setFlagModal({ 
                              reviewId: review.id, 
                              show: true, 
                              reason: '' 
                            })}
                            disabled={flaggingReview === review.id}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {flaggingReview === review.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                            ) : (
                              <FlagIcon className="w-4 h-4 mr-2" />
                            )}
                            Flag
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center text-sm text-gray-700">
                      <p>
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Flag Review Modal */}
        {flagModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Flag Review</h3>
                <button
                  onClick={() => setFlagModal({ reviewId: 0, show: false, reason: '' })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Please provide a reason for flagging this review. Our admin team will review it.
                </p>
                <textarea
                  value={flagModal.reason}
                  onChange={(e) => setFlagModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for flagging..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setFlagModal({ reviewId: 0, show: false, reason: '' })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagReview}
                  disabled={!flagModal.reason.trim() || flaggingReview === flagModal.reviewId}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {flaggingReview === flagModal.reviewId ? 'Flagging...' : 'Flag Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
