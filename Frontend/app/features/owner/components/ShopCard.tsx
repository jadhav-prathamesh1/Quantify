import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Store } from '../services/owner.api';
import { Button } from '../../../components/Button';

interface ShopCardProps {
  store: Store;
  onEdit?: (store: Store) => void;
  onDelete?: (store: Store) => void;
  onViewInsights?: (store: Store) => void;
}

export function ShopCard({ store, onEdit, onDelete, onViewInsights }: ShopCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rating = parseFloat(store.averageRating || '0');

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <StarIconSolid className="w-4 h-4 text-yellow-400 absolute top-0 left-0 clip-path-half" />
          </div>
        );
      } else {
        stars.push(
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative h-64 preserve-3d cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.6s ease-in-out',
      }}
    >
      {/* Front of Card */}
      <div 
        className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 backface-hidden"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <div className="flex flex-col h-full">
          {/* Store Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(rating)}
                <span className="text-sm font-medium text-gray-600">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>

          {/* Store Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{store.address}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{store.email}</span>
            </div>
            {store.phone && (
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{store.phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{store.totalReviews || 0} reviews</span>
              <span>Click to flip</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back of Card */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-gray-200 p-6 backface-hidden"
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)' 
        }}
      >
        <div className="flex flex-col h-full">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Store Actions</h4>
          
          <div className="flex-1 space-y-3">
            {onViewInsights && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onViewInsights(store);
                }}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <StarIcon className="w-4 h-4 mr-2" />
                View Insights
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit(store);
                }}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Store
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(store);
                }}
                className="w-full flex items-center justify-start px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 hover:bg-red-50 rounded-md transition-colors"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Store
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">Click to flip back</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
