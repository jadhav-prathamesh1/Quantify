import { useState } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { addReview } from '../services/user.api';

interface ReviewFormProps {
  storeId: number;
  initialData?: {
    rating: number;
    comment: string;
  };
  isEditing?: boolean;
  onSuccess: (data?: { rating: number; comment?: string }) => void;
  onClose: () => void;
}

export default function ReviewForm({ storeId, initialData, isEditing = false, onSuccess, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      console.log('Review Form - Starting submission:', {
        isEditing,
        storeId,
        rating,
        comment: comment.trim(),
        timestamp: new Date().toISOString()
      });
      
      if (isEditing) {
        console.log('Review Form - Editing mode, calling onSuccess directly');
        onSuccess({ rating, comment: comment.trim() || undefined });
      } else {
        console.log('Review Form - Creating new review');
        const reviewData = {
          rating,
          comment: comment.trim() || undefined,
        };
        
        console.log('Review Form - Calling API with:', reviewData);
        const result = await addReview(storeId, reviewData);
        console.log('Review Form - API call successful:', result);
        
        onSuccess();
      }
    } catch (err: any) {
      console.error('Review Form - Submission error:', {
        error: err,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
        stack: err.stack
      });
      
      // Enhanced error handling
      if (err.response?.status === 401) {
        setError('Please log in to submit a review');
      } else if (err.response?.status === 409) {
        setError('You have already reviewed this store');
      } else if (err.response?.status === 404) {
        setError('Store not found');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const currentRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(i)}
          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          {i <= currentRating ? (
            <StarIcon className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors" />
          ) : (
            <StarOutlineIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400 transition-colors" />
          )}
        </button>
      );
    }

    return stars;
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select Rating';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Edit Review' : 'Write a Review'}
          </h2>
          <p className="text-gray-600">
            {isEditing ? 'Update your review' : 'Share your experience with other customers'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </label>
            <div className="flex justify-center space-x-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {getRatingText(hoverRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Tell others about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Help others by sharing your detailed experience
              </p>
              <p className="text-xs text-gray-500">
                {comment.length}/500
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                isEditing ? 'Update Review' : 'Submit Review'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
