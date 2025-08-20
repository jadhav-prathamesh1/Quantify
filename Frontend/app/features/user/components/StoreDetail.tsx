import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '~/providers/AuthProvider';
import { getStore, getStoreReviews, addReview } from '../services/user.api';
import ReviewForm from './ReviewForm';

interface Store {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface StoreDetailProps {
  storeId: number;
}

export default function StoreDetail({ storeId }: StoreDetailProps) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStoreAndReviews = async () => {
      try {
        setLoading(true);
        const [storeData, reviewsData] = await Promise.all([
          getStore(storeId),
          getStoreReviews(storeId, { page: 1, limit: 5 })
        ]);
        
        setStore(storeData);
        setReviews(reviewsData.reviews || []);
        setTotalPages(reviewsData.totalPages || 1);
      } catch (error) {
        console.error('Error fetching store details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndReviews();
  }, [storeId]);

  const loadMoreReviews = async (page: number) => {
    try {
      setReviewsLoading(true);
      const reviewsData = await getStoreReviews(storeId, { page: page, limit: 5 });
      setReviews(prev => [...prev, ...reviewsData.reviews]);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview: any) => {
    setReviews(prev => [newReview, ...prev]);
    setShowReviewForm(false);
    
    // Update store rating (simplified - in real app would refetch store data)
    if (store) {
      const newTotalRatings = store.totalRatings + 1;
      const newAverageRating = (store.averageRating * store.totalRatings + newReview.rating) / newTotalRatings;
      setStore({ ...store, averageRating: newAverageRating, totalRatings: newTotalRatings });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <svg
          key={index}
          className={`w-5 h-5 ${
            starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Restaurant: 'bg-orange-100 text-orange-800',
      Retail: 'bg-blue-100 text-blue-800',
      Service: 'bg-green-100 text-green-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Healthcare: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Store not found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.history.back()}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Stores
        </motion.button>

        {/* Store Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{store.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(store.category)}`}>
                  {store.category}
                </span>
              </div>

              <p className="text-gray-600 text-lg mb-6">{store.description}</p>

              <div className="flex items-center text-gray-500 mb-6">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{store.location}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  {renderStars(Math.round(store.averageRating))}
                  <span className="ml-2 text-xl font-semibold text-gray-800">
                    {store.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({store.totalRatings} review{store.totalRatings !== 1 ? 's' : ''})
                </span>
              </div>
            </div>

            {user && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Write a Review
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.444l-3.178 1.585a1 1 0 01-1.276-1.276l1.585-3.178A8.959 8.959 0 013 12a8 8 0 018-8 8 8 0 018 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No reviews yet</h3>
              <p className="text-gray-600">Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.name?.charAt(0) || review.user.email.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {review.user.name || review.user.email.split('@')[0]}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {review.rating}.0
                        </span>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="text-center pt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadMoreReviews(currentPage + 1)}
                    disabled={reviewsLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50"
                  >
                    {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            storeId={storeId}
            onSuccess={handleReviewSubmitted}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </div>
    </div>
  );
}
