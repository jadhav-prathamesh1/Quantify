import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router';
import { 
  StarIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { getStore, getStoreReviews } from '../services/user.api';
import RatingsDistributionChart from '../components/Charts/RatingsDistributionChart';
import ReviewForm from '../components/ReviewForm';

interface StoreDetails {
  id: number;
  name: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  owner: {
    name: string;
    email: string;
  };
  avgRating: number;
  totalReviews: number;
  ratingsDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  createdAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
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

export default function StoreDetail() {
  const { id } = useParams();
  const storeId = parseInt(id as string);
  
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [reviews, setReviews] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const storeData = await getStore(storeId);
        setStore(storeData);
      } catch (err) {
        setError('Failed to load store details');
        console.error('Store fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const reviewsData = await getStoreReviews(storeId, { page: reviewPage, limit: 5 });
        setReviews(reviewsData);
      } catch (err) {
        console.error('Reviews fetch error:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (storeId) {
      fetchReviews();
    }
  }, [storeId, reviewPage]);

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);
    // Refresh store data and reviews without full page reload
    try {
      const [storeData, reviewsData] = await Promise.all([
        getStore(storeId),
        getStoreReviews(storeId, { page: 1, limit: 5 })
      ]);
      setStore(storeData);
      setReviews(reviewsData);
      setReviewPage(1);
    } catch (err) {
      console.error('Error refreshing data:', err);
      // Fallback to page reload if needed
      window.location.reload();
    }
  };

  const renderStars = (rating: number, size: string = 'h-5 w-5') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className={`${size} text-yellow-400`} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarOutlineIcon className={`${size} text-gray-300`} />
          <StarIcon 
            className={`${size} text-yellow-400 absolute inset-0`} 
            style={{ clipPath: 'inset(0 50% 0 0)' }} 
          />
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarOutlineIcon key={`empty-${i}`} className={`${size} text-gray-300`} />
      );
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="bg-white rounded-xl h-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl h-96"></div>
              <div className="bg-white rounded-xl h-96"></div>
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
          <div className="text-red-500 text-lg font-semibold mb-4">{error}</div>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Stores
        </motion.button>

        {store && (
          <>
            {/* Store Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-8 shadow-lg mb-8"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="flex-1 mb-6 lg:mb-0">
                  <div className="flex items-center mb-2">
                    <BuildingStorefrontIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {store.category || 'General'}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{store.name}</h1>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center mr-4">
                      {renderStars(store.avgRating, 'h-6 w-6')}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{store.avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-lg ml-2">
                      ({store.totalReviews} review{store.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{store.address}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-5 w-5 mr-2" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <EnvelopeIcon className="h-5 w-5 mr-2" />
                      <span>{store.email}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Write Review
                </motion.button>
              </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Rating Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RatingsDistributionChart 
                  distribution={store.ratingsDistribution} 
                  totalReviews={store.totalReviews} 
                />
              </motion.div>

              {/* Store Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner</label>
                    <p className="text-gray-900">{store.owner.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-900">{store.category || 'General'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Contact Email</label>
                    <p className="text-gray-900">{store.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Established</label>
                    <p className="text-gray-900">{formatDate(store.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-8 shadow-lg mt-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Customer Reviews ({store.totalReviews})
                </h3>
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                      <div className="h-16 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {review.userName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.userName}</p>
                            <div className="flex items-center">
                              {renderStars(review.rating, 'h-4 w-4')}
                              <span className="ml-2 text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      )}
                    </motion.div>
                  ))}

                  {/* Reviews Pagination */}
                  {reviews.pagination.pages > 1 && (
                    <div className="flex justify-center items-center space-x-2 pt-6">
                      <button
                        onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                        disabled={reviewPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-gray-600">
                        Page {reviewPage} of {reviews.pagination.pages}
                      </span>
                      
                      <button
                        onClick={() => setReviewPage(Math.min(reviews.pagination.pages, reviewPage + 1))}
                        disabled={reviewPage === reviews.pagination.pages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            storeId={storeId}
            onSuccess={handleReviewSuccess}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
}
