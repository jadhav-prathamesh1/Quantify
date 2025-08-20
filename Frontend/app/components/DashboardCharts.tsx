import React from 'react';
import { motion } from 'framer-motion';

export interface ChartData {
  ratingsOverTime: Array<{ date: string; value: number }>;
  roleDistribution: Array<{ role: string; count: number }>;
}

interface DashboardChartsProps {
  chartData: ChartData;
}

export default function DashboardCharts({ chartData }: DashboardChartsProps) {
  // Add null safety checks
  if (!chartData || !chartData.ratingsOverTime || !chartData.roleDistribution) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate max value for scaling the ratings chart
  const maxRatings = Math.max(...chartData.ratingsOverTime.map(d => d.value)) || 100;

  // Color mapping for roles
  const roleColors: { [key: string]: string } = {
    'ADMIN': '#dc2626',     // red-600
    'OWNER': '#2563eb',     // blue-600  
    'USER': '#16a34a',      // green-600
    'admin': '#dc2626',
    'owner': '#2563eb',
    'user': '#16a34a',
    'STORE_OWNER': '#2563eb',
    'store_owner': '#2563eb'
  };

  // Add colors to role distribution data
  const roleDistributionWithColors = (chartData.roleDistribution || []).map(role => ({
    ...role,
    color: roleColors[role.role] || '#6b7280' // fallback to gray-500
  }));

  const totalUsers = (chartData.roleDistribution || []).reduce((sum, role) => sum + role.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Ratings Over Time Line Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Ratings Trend</h3>
          <span className="text-sm text-gray-600">Last 7 days</span>
        </div>
        
        <div className="h-64">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Chart line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              d={`M ${chartData.ratingsOverTime.map((point, index) => {
                const x = (index / (chartData.ratingsOverTime.length - 1)) * 360 + 20;
                const y = 180 - (point.value / maxRatings) * 160;
                return `${x},${y}`;
              }).join(' L ')}`}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              className="filter drop-shadow-sm"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Data points */}
            {chartData.ratingsOverTime.map((point, index) => {
              const x = (index / (chartData.ratingsOverTime.length - 1)) * 360 + 20;
              const y = 180 - (point.value / maxRatings) * 160;
              return (
                <motion.circle
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  className="filter drop-shadow-sm"
                />
              );
            })}
          </svg>
        </div>
        
        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>Week Start</span>
          <span>Today</span>
        </div>
        
        {/* Data labels */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-4">
            {chartData.ratingsOverTime.slice(-3).map((point, index) => (
              <span key={index} className="text-xs text-gray-500">
                {point.date}: {point.value}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Role Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Role Distribution</h3>
          <span className="text-sm text-gray-600">{totalUsers} total users</span>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {roleDistributionWithColors.map((role, index) => {
                const percentage = (role.count / totalUsers) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = roleDistributionWithColors
                  .slice(0, index)
                  .reduce((sum, r) => sum + (r.count / totalUsers) * 360, 0);
                
                const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 100 + 80 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const y2 = 100 + 80 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                
                const largeArc = angle > 180 ? 1 : 0;
                
                return (
                  <motion.path
                    key={role.role}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.6 + index * 0.2 }}
                    d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={role.color}
                    className="filter drop-shadow-sm"
                  />
                );
              })}
              
              {/* Center circle */}
              <circle cx="100" cy="100" r="30" fill="white" className="filter drop-shadow-sm" />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                <div className="text-xs text-gray-500">Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 space-y-2">
          {roleDistributionWithColors.map((role, index) => {
            const percentage = Math.round((role.count / totalUsers) * 100);
            return (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {role.role.toLowerCase()}s
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{role.count}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
