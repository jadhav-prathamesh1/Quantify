import React from 'react';
import { motion } from 'framer-motion';
import {
  BuildingStorefrontIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface OwnerDashboardStatsProps {
  stats: {
    totalStores: number;
    totalReviews: number;
    averageRating: number;
    storeLimit?: number;
  };
}

export default function OwnerDashboardStats({ stats }: OwnerDashboardStatsProps) {
  const statItems = [
    {
      id: 1,
      name: 'Total Stores',
      stat: `${stats.totalStores}/${stats.storeLimit || 2}`,
      icon: BuildingStorefrontIcon,
      change: stats.totalStores > 0 ? `${((stats.totalStores / (stats.storeLimit || 2)) * 100).toFixed(0)}% of limit used` : 'No stores yet',
      changeType: stats.totalStores < (stats.storeLimit || 2) ? 'increase' : 'neutral',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Average Rating',
      stat: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ⭐` : 'No ratings',
      icon: StarIcon,
      change: stats.averageRating > 0 ? `${stats.averageRating >= 4 ? 'Excellent' : stats.averageRating >= 3 ? 'Good' : 'Needs improvement'}` : 'Get your first rating',
      changeType: stats.averageRating >= 4 ? 'increase' : stats.averageRating >= 3 ? 'neutral' : 'decrease',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 3,
      name: 'Customer Reviews',
      stat: stats.totalReviews.toLocaleString(),
      icon: ChatBubbleBottomCenterTextIcon,
      change: stats.totalReviews > 0 ? `${stats.totalReviews} total feedback` : 'No reviews yet',
      changeType: stats.totalReviews > 10 ? 'increase' : stats.totalReviews > 0 ? 'neutral' : 'decrease',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 4,
      name: 'Business Growth',
      stat: stats.totalStores > 0 ? 'Active' : 'Getting Started',
      icon: ArrowTrendingUpIcon,
      change: stats.totalStores > 0 ? 'Business is online' : 'Add your first store',
      changeType: stats.totalStores > 0 ? 'increase' : 'neutral',
      gradient: 'from-purple-500 to-indigo-500'
    },
  ];

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Business Overview</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative bg-white pt-5 px-4 pb-4 sm:pt-6 sm:px-6 shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5`}></div>
            
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.stat}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  <div className={`flex items-center ${
                    item.changeType === 'increase' 
                      ? 'text-green-600' 
                      : item.changeType === 'decrease' 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {item.changeType === 'increase' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.changeType === 'decrease' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {item.changeType === 'neutral' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm">{item.change}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
