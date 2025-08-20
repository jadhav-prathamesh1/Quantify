import React from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/AuthProvider';
import { Button } from '../components/Button';
import { MarketingStrategyAnimation } from '../components/MarketingStrategyAnimation';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Store Rating Platform</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700">Welcome, {user?.name}</span>
                  <Link to="/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="secondary" size="sm">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Hero Section */}
          <div className="relative">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Rate & Discover
              <span className="text-blue-600 block">Amazing Stores</span>
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our community-driven platform where customers rate stores, owners manage their reputation, 
            and admins ensure quality experiences for everyone.
          </p>

          {/* Marketing Strategy Animation */}
          <MarketingStrategyAnimation 
            width={320} 
            height={320} 
            delay={0.2}
            className="mb-12"
          />

          {!isAuthenticated && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
