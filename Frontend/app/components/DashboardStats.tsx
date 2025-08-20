import React from 'react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalStores: number;
    totalRatings: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Stores',
      value: stats.totalStores,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Total Ratings',
      value: stats.totalRatings,
      color: 'bg-purple-500',
      trend: '+25%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="text-2xl font-bold text-gray-900 mt-1"
              >
                {stat.value.toLocaleString()}
              </motion.p>
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <span className="mr-1">↗</span>
                {stat.trend} from last month
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
