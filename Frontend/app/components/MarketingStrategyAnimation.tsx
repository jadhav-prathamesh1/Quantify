import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

interface AnimatedLottieProps {
  className?: string;
  width?: number;
  height?: number;
  delay?: number;
}

export const MarketingStrategyAnimation = ({ 
  className = "", 
  width = 300, 
  height = 300, 
  delay = 0.2 
}: AnimatedLottieProps) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set client-side flag
    setIsClient(true);
    
    // Fetch the animation data from the public folder
    fetch('/assets/animations/man-checking-strategy.json')
      .then(response => response.json())
      .then(data => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading animation:', error);
        setLoading(false);
      });
  }, []);

  // Show loading placeholder during SSR and client hydration
  if (!isClient || loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl p-6 flex items-center justify-center shadow-lg"
          style={{ width: width * 0.8, height: height * 0.8 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm font-medium text-gray-700">
              {loading ? 'Loading...' : 'Analytics'}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 flex items-center justify-center shadow-lg"
          style={{ width: width * 0.8, height: height * 0.8 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <div className="text-sm font-medium text-gray-700">Animation unavailable</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={`flex justify-center ${className}`}
    >
      <Lottie
        animationData={animationData}
        style={{ width, height }}
        className="max-w-sm mx-auto"
        loop={true}
        autoplay={true}
      />
    </motion.div>
  );
};
