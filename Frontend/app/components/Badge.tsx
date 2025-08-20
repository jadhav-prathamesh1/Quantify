import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  role: string;
  status?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ role, status, className = '' }) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </motion.span>
      
      {status && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </motion.span>
      )}
    </div>
  );
};
