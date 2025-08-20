import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../providers/AuthProvider';
import { Badge } from '../components/Badge';

interface UserLayoutProps {
  children: React.ReactNode;
}

function SidebarContent({ navigation }: { navigation: any[] }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-purple-600">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <BuildingStorefrontIcon className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-white font-bold text-lg">Quantify User</span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 px-2 pb-4 space-y-1">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
                      <Link
            to={item.href}
            className={`${
              item.current
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            } group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200`}
          >
              <item.icon
                className={`${
                  item.current ? item.color : 'text-gray-400 group-hover:text-gray-500'
                } flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors duration-200`}
              />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {item.badge}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center w-full group">
          <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="ml-2 p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export function UserLayout({ children }: UserLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/user', 
      icon: HomeIcon, 
      current: location.pathname === '/user',
      color: 'text-purple-600' 
    },
    { 
      name: 'Discover Stores', 
      href: '/user/stores', 
      icon: MagnifyingGlassIcon, 
      current: location.pathname === '/user/stores' || location.pathname.startsWith('/user/stores/'),
      color: 'text-blue-600' 
    },
    { 
      name: 'My Reviews', 
      href: '/user/reviews', 
      icon: StarIcon, 
      current: location.pathname === '/user/reviews',
      color: 'text-yellow-600' 
    },
    { 
      name: 'My Profile', 
      href: '/user/profile', 
      icon: UserIcon, 
      current: location.pathname === '/user/profile',
      color: 'text-green-600' 
    },
  ];

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
                <SidebarContent navigation={navigation} />
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <SidebarContent navigation={navigation} />
          </div>
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
                User Portal
              </h1>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="ml-3"
              >
                <Badge role="USER" status="ACTIVE" />
              </motion.div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
