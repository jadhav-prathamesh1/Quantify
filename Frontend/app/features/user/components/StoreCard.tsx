import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StoreCardProps {
  store: {
    id: number;
    name: string;
    category: string;
    address: string;
    avgRating: number;
    totalReviews: number;
  };
  onClick: (storeId: number) => void;
}

export default function StoreCard({ store, onClick }: StoreCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className="h-4 w-4 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarOutlineIcon className="h-4 w-4 text-gray-300" />
          <StarIcon className="h-4 w-4 text-yellow-400 absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarOutlineIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(store.id)}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
    >
      {/* Store Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
            {store.name}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {store.category || 'General'}
            </span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-3">
        <div className="flex items-center mr-3">
          {renderStars(store.avgRating)}
        </div>
        <span className="text-lg font-semibold text-gray-900">
          {store.avgRating.toFixed(1)}
        </span>
        <span className="text-gray-500 text-sm ml-2">
          ({store.totalReviews} review{store.totalReviews !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Address */}
      <div className="flex items-start text-gray-600 text-sm mb-4">
        <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
        <span className="line-clamp-2">{store.address}</span>
      </div>

      {/* Action Button */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {store.totalReviews === 0 ? 'No reviews yet' : `${store.totalReviews} reviews`}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}
