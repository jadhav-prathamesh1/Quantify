import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

interface RatingsDistributionChartProps {
  distribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
  totalReviews: number;
}

export default function RatingsDistributionChart({ distribution, totalReviews }: RatingsDistributionChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Rating Distribution</h3>
      
      <div className="space-y-3">
        {distribution.slice().reverse().map((item, index) => (
          <motion.div
            key={item.rating}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            {/* Rating Label */}
            <div className="flex items-center w-16 text-sm font-medium text-gray-700">
              <span className="mr-1">{item.rating}</span>
              <StarIcon className="h-4 w-4 text-yellow-400" />
            </div>

            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    item.rating >= 4
                      ? 'bg-green-500'
                      : item.rating >= 3
                      ? 'bg-yellow-500'
                      : item.rating >= 2
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Count and Percentage */}
            <div className="w-20 text-right text-sm">
              <span className="font-medium text-gray-900">{item.count}</span>
              <span className="text-gray-500 ml-1">({item.percentage}%)</span>
            </div>
          </motion.div>
        ))}
      </div>

      {totalReviews === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to leave a review!</p>
        </div>
      )}
    </div>
  );
}
