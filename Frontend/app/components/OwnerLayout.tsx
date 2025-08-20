import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { 
  ChartBarIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../providers/AuthProvider';
import { Badge } from '../components/Badge';

interface OwnerLayoutProps {
  children: React.ReactNode;
  storeCount?: number;
  storeLimit?: number;
}

export function OwnerLayout({ children, storeCount = 0, storeLimit = 2 }: OwnerLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/owner', 
      icon: HomeIcon, 
      current: location.pathname === '/owner',
      color: 'text-blue-600' 
    },
    { 
      name: 'My Stores', 
      href: '/owner/shops', 
      icon: BuildingStorefrontIcon, 
      current: location.pathname === '/owner/shops',
      color: 'text-purple-600' 
    },
    { 
      name: 'Analytics', 
      href: '/owner/insights', 
      icon: ChartBarIcon, 
      current: location.pathname === '/owner/insights',
      color: 'text-green-600' 
    },
    { 
      name: 'Reviews', 
      href: '/owner/reviews', 
      icon: ChatBubbleBottomCenterTextIcon, 
      current: location.pathname === '/owner/reviews',
      color: 'text-yellow-600' 
    },
    { 
      name: 'Profile', 
      href: '/owner/profile', 
      icon: UserIcon, 
      current: location.pathname === '/owner/profile',
      color: 'text-indigo-600' 
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile menu */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex z-40 md:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-600 bg-opacity-75"
                onClick={() => setSidebarOpen(false)}
              />
              
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </button>
                </div>
                <SidebarContent navigation={navigation} user={user} storeCount={storeCount} storeLimit={storeLimit} />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} user={user} storeCount={storeCount} storeLimit={storeLimit} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Store Owner Portal
              </h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-3"
              >
                <Badge role="OWNER" status={user?.status || 'PENDING'} />
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/owner/profile'}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-1" />
                Settings
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, user, storeCount = 0, storeLimit = 2 }: { navigation: any[], user: any, storeCount?: number, storeLimit?: number }) {
  return (
    <div className="flex flex-col h-0 flex-1">
      {/* Logo area */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-purple-600 to-indigo-600">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex items-center"
        >
          <BuildingStorefrontIcon className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">Quantify</span>
          <span className="ml-1 text-sm text-purple-200">Owner</span>
        </motion.div>
      </div>

      {/* User Status Banner */}
      {user?.status === 'PENDING' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mx-2 mt-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-700">
                Account pending approval
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-white border-r border-gray-200">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = user?.status === 'PENDING' && item.name !== 'Dashboard' && item.name !== 'Profile';
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => !isDisabled && (window.location.href = item.href)}
                  disabled={isDisabled}
                  className={`${
                    item.current
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-r-4 border-purple-500 text-purple-700'
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full text-left relative`}
                >
                  <Icon
                    className={`${
                      item.current 
                        ? item.color 
                        : isDisabled 
                        ? 'text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-200`}
                  />
                  {item.name}
                  {isDisabled && (
                    <div className="ml-auto">
                      <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                  {item.current && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 w-1 h-8 bg-purple-500 rounded-l-full"
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>

        {/* Store Status */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Store Limit</span>
              <span className="text-xs font-medium text-gray-900">{storeCount}/{storeLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full" style={{width: `${Math.min((storeCount / storeLimit) * 100, 100)}%`}}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${
                user?.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-xs text-gray-500">
                {user?.status === 'ACTIVE' ? 'Account Active' : 'Pending Approval'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
