import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  MapPinIcon,
  KeyIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AdminLayout } from '../../components/AdminLayout';
import { DataTable } from '../../components/DataTable';
import type { TableColumn, TableAction } from '../../components/DataTable';
import { ModalForm } from '../../components/ModalForm';
import { Badge } from '../../components/Badge';
import toast from 'react-hot-toast';
import { adminApiService } from '../../services/admin-api';
import type { User, ApiResponse } from '../../services/admin-api';
import { useAuth } from '../../providers/AuthProvider';

export default function AdminUsers() {
  // ALL hooks must be called first, before any conditional logic
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // Check if user has admin role
    if (!authLoading && isAuthenticated && currentUser && currentUser.role !== 'ADMIN') {
      toast.error('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, currentUser]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [isAuthenticated, currentUser]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  // Don't render if not admin (will redirect)
  if (currentUser.role !== 'ADMIN') {
    return null;
  }

  const fetchUsers = async (page = 1, search = '', filters: any = {}) => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response: ApiResponse<User[]> = await adminApiService.getUsers({
          page,
          limit: 10,
          search,
          ...filters
        });
        setUsers(response.data);
        setTotalUsers(response.meta?.total || 0);
        setCurrentPage(page);
      } catch (apiError) {
        // If API fails (likely auth issue), show demo data with a message
        console.log('API call failed, showing demo data:', apiError);
        
        const demoUsers: User[] = [
          {
            id: 1,
            name: "John Doe Administrator",
            email: "john@admin.com",
            address: "123 Admin Street, Admin City",
            role: "ADMIN",
            status: "ACTIVE",
            createdAt: "2025-01-15T10:00:00Z"
          },
          {
            id: 2,
            name: "Jane Smith Store Owner",
            email: "jane@store.com",
            address: "456 Owner Avenue, Business District",
            role: "OWNER",
            status: "ACTIVE", 
            createdAt: "2025-01-20T14:30:00Z"
          },
          {
            id: 3,
            name: "Bob Johnson Regular User",
            email: "bob@user.com",
            address: "789 User Lane, Residential Area",
            role: "USER",
            status: "ACTIVE",
            createdAt: "2025-01-25T09:15:00Z"
          }
        ];
        
        setUsers(demoUsers);
        setTotalUsers(demoUsers.length);
        setCurrentPage(1);
        
        // Show info message about demo data
        toast.error('🔗 Backend connection failed. Showing demo data. Please login as admin and start backend server.', {
          duration: 5000,
          style: {
            background: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #F59E0B',
            borderRadius: '8px',
          }
        });
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value: string, user: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {value[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      title: 'Address',
      render: (value: string) => (
        <div className="max-w-xs">
          <div className="text-sm text-gray-900 truncate">
            {value || 'Not provided'}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value: string, user: User) => (
        <Badge role={value} status={user.status} />
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => {
        const colors = {
          ACTIVE: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          INACTIVE: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value.toLowerCase()}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-900">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  const actions: TableAction[] = [
    {
      icon: EyeIcon,
      title: 'View Details',
      onClick: (user: User) => {
        setSelectedUser(user);
        setShowViewModal(true);
      },
      color: 'blue'
    },
    {
      icon: PencilIcon,
      title: 'Edit User',
      onClick: (user: User) => {
        setSelectedUser(user);
        setShowEditModal(true);
      },
      color: 'green'
    },
    {
      icon: TrashIcon,
      title: 'Delete User',
      onClick: (user: User) => handleDeleteUser(user),
      color: 'red',
      show: (user: User) => user.role !== 'ADMIN'
    }
  ];

  const handleAddUser = async (userData: any) => {
    try {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Validate password length
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const newUser = await adminApiService.createUser({
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        address: userData.address?.trim() || '',
        role: userData.role,
      });
      
      setUsers(prev => [newUser, ...prev]);
      setTotalUsers(prev => prev + 1);
      toast.success(`User "${userData.name}" added successfully!`);
    } catch (error: any) {
      console.error('Add user error:', error);
      throw new Error(error.message || 'Failed to add user');
    }
  };

  const handleEditUser = async (userData: any) => {
    try {
      if (!selectedUser) return;
      
      // Validate required fields
      if (!userData.name || !userData.email || !userData.role) {
        throw new Error('Please fill in all required fields');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      const updatedUser = await adminApiService.updateUser(selectedUser.id, {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        address: userData.address?.trim() || '',
        role: userData.role,
        status: userData.status,
      });
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      toast.success(`User "${userData.name}" updated successfully!`);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Edit user error:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete "${user.name}"?\n\nThis action cannot be undone.`)) {
      try {
        await adminApiService.deleteUser(user.id);
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setTotalUsers(prev => prev - 1);
        toast.success(`User "${user.name}" deleted successfully!`);
      } catch (error: any) {
        console.error('Delete user error:', error);
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  const userFormFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text' as const,
      icon: UserIcon,
      required: true,
      placeholder: 'Enter full name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email' as const,
      icon: EnvelopeIcon,
      required: true,
      placeholder: 'Enter email address'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      icon: KeyIcon,
      required: true,
      placeholder: 'Enter password'
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea' as const,
      icon: MapPinIcon,
      placeholder: 'Enter complete address'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'USER', label: 'User' },
        { value: 'OWNER', label: 'Store Owner' },
        { value: 'ADMIN', label: 'Administrator' }
      ]
    }
  ];

  const editUserFormFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text' as const,
      icon: UserIcon,
      required: true,
      placeholder: 'Enter full name'
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email' as const,
      icon: EnvelopeIcon,
      required: true,
      placeholder: 'Enter email address'
    },
    {
      name: 'address',
      label: 'Address',
      type: 'textarea' as const,
      icon: MapPinIcon,
      placeholder: 'Enter complete address'
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'USER', label: 'User' },
        { value: 'OWNER', label: 'Store Owner' },
        { value: 'ADMIN', label: 'Administrator' }
      ]
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'INACTIVE', label: 'Inactive' }
      ]
    }
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-blue-100">
              Manage user accounts, roles, and permissions across your platform
            </p>
          </div>
        </motion.div>

        <DataTable
          data={users}
          columns={columns}
          actions={actions}
          title="Users"
          subtitle={`${totalUsers} registered users`}
          searchPlaceholder="Search by name, email, or address..."
          onAdd={() => setShowAddModal(true)}
          addButtonText="Add User"
          loading={loading}
          emptyState={{
            title: 'No users found',
            description: 'Get started by adding your first user to the platform.'
          }}
        />

        {/* Add User Modal */}
        <ModalForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New User"
          fields={userFormFields}
          onSubmit={handleAddUser}
          initialData={{}}
        />

        {/* Edit User Modal */}
        <ModalForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title="Edit User"
          fields={editUserFormFields}
          initialData={selectedUser || {}}
          onSubmit={handleEditUser}
        />

        {/* View User Modal */}
        {selectedUser && showViewModal && (
          <motion.div
            className={`fixed inset-0 z-50 overflow-y-auto ${showViewModal ? '' : 'hidden'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: showViewModal ? 1 : 0 }}
          >
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowViewModal(false)}
              />
              
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: showViewModal ? 1 : 0.95, opacity: showViewModal ? 1 : 0 }}
                className="relative inline-block transform overflow-hidden rounded-lg bg-white px-6 pt-6 pb-6 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8"
              >
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setShowViewModal(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {selectedUser?.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedUser?.name || 'Unknown User'}</h3>
                    <p className="text-gray-600 text-lg">{selectedUser?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Role & Status</label>
                      <div className="flex items-center space-x-2">
                        <Badge role={selectedUser.role} status={selectedUser.status} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md">
                        <p className="text-gray-900 font-mono">#{selectedUser.id}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md">
                        <p className="text-gray-900 break-all">{selectedUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md min-h-[60px]">
                        <p className="text-gray-900">
                          {selectedUser.address || 'No address provided'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                      <div className="bg-gray-50 px-3 py-2 rounded-md">
                        <p className="text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-6 sm:flex sm:flex-row-reverse sm:space-x-reverse sm:space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Edit User
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
