import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingStorefrontIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  TagIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../providers/AuthProvider';
import { OwnerLayout } from '../../components/OwnerLayout';
import { useStoreCount } from '../../hooks/useStoreCount';
import { ownerApiService, type Store, type CreateStoreDto, type UpdateStoreDto } from '../../features/owner/services/owner.api';
import toast from 'react-hot-toast';

interface StoreFormData {
  name: string;
  email: string;
  address: string;
  category: string;
  phone: string;
}

export default function OwnerShops() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { storeCount, storeLimit, refreshStoreCount } = useStoreCount();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    email: '',
    address: '',
    category: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // URL parameter check for add=true
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setShowAddModal(true);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Authentication check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!authLoading && isAuthenticated && user && user.role !== 'OWNER') {
      toast.error('Access denied. Store owner privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  // Fetch stores data
  useEffect(() => {
    if (isAuthenticated && user?.role === 'OWNER' && user.id) {
      fetchStores();
    }
  }, [isAuthenticated, user]);

  const fetchStores = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const storesData = await ownerApiService.getOwnerStores(user.id, { limit: 10 });
      setStores(storesData.stores);
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = () => {
    if (user?.status !== 'ACTIVE') {
      toast.error('Account must be approved before adding stores');
      return;
    }
    if (stores.length >= 2) {
      toast.error('Maximum of 2 stores allowed per owner');
      return;
    }
    setFormData({ name: '', email: '', address: '', category: '', phone: '' });
    setEditingStore(null);
    setShowAddModal(true);
  };

  const handleEditStore = (store: Store) => {
    setFormData({
      name: store.name,
      email: store.email,
      address: store.address,
      category: store.category || '',
      phone: store.phone || ''
    });
    setEditingStore(store);
    setShowAddModal(true);
  };

  const handleDeleteStore = async (store: Store) => {
    if (!user?.id) return;

    if (confirm(`Are you sure you want to delete "${store.name}"? This action cannot be undone and will remove all associated reviews.`)) {
      try {
        await ownerApiService.deleteStore(user.id, store.id);
        setStores(prev => prev.filter(s => s.id !== store.id));
        refreshStoreCount(); // Refresh store count after deletion
        toast.success('Store deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete store:', error);
        toast.error(error.response?.data?.message || 'Failed to delete store');
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSubmitting(true);

      if (editingStore) {
        // Update existing store
        const updateData: UpdateStoreDto = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          category: formData.category || undefined,
          phone: formData.phone || undefined
        };
        const updatedStore = await ownerApiService.updateStore(user.id, editingStore.id, updateData);
        setStores(prev => prev.map(s => s.id === editingStore.id ? updatedStore : s));
        toast.success('Store updated successfully');
      } else {
        // Create new store
        const createData: CreateStoreDto = {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          category: formData.category || undefined,
          phone: formData.phone || undefined
        };
        const newStore = await ownerApiService.createStore(user.id, createData);
        setStores(prev => [...prev, newStore]);
        refreshStoreCount(); // Refresh store count after creation
        toast.success('Store created successfully');
      }

      setShowAddModal(false);
      setFormData({ name: '', email: '', address: '', category: '', phone: '' });
      setEditingStore(null);
    } catch (error: any) {
      console.error('Failed to save store:', error);
      toast.error(error.response?.data?.message || 'Failed to save store');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewInsights = (store: Store) => {
    window.location.href = `/owner/insights?storeId=${store.id}`;
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated or not owner
  if (!isAuthenticated || !user || user.role !== 'OWNER') {
    return null;
  }

  return (
    <OwnerLayout storeCount={storeCount} storeLimit={storeLimit}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Stores</h1>
            <p className="text-gray-600">Manage your store locations and information</p>
          </div>
          {user?.status === 'ACTIVE' && stores.length < 2 && (
            <button
              onClick={handleAddStore}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add New Store
            </button>
          )}
        </div>

        {/* Account Status Notice */}
        {user?.status === 'PENDING' && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Account Pending Approval</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your account is pending admin approval. Adding new stores is disabled until your account is approved by the admin team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Privacy Notice */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Data Privacy & Access</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can only view and manage stores that belong to your account. All store data, ratings, and reviews displayed are specific to your ownership and cannot be accessed by other store owners.
              </p>
            </div>
          </div>
        </div>

        {/* Store Limit Info */}
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-900 font-medium">
                Store Usage: {stores.length}/2
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {stores.length === 0 ? 'No stores created yet' : 
               stores.length === 1 ? '1 more store available' : 
               'Maximum stores reached'}
            </div>
          </div>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stores.length / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <BuildingStorefrontIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores yet</h3>
            <p className="text-gray-600 mb-6">
              {user?.status === 'PENDING' 
                ? "Once your account is approved, you can add your first store."
                : "Get started by creating your first store to begin receiving customer reviews."
              }
            </p>
            {user?.status === 'ACTIVE' && (
              <button
                onClick={handleAddStore}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Your First Store
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                      <div className="flex items-center text-yellow-500 mb-2">
                        <StarIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">
                          {store.averageRating ? `${parseFloat(store.averageRating).toFixed(1)}` : '0.0'}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          ({store.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewInsights(store)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Insights"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStore(store)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Store"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Store"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </div>
                    <div className="flex items-center">
                      <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.category && (
                      <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="capitalize">{store.category}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 border-t">
                  <div className="text-xs text-gray-500">
                    Created {new Date(store.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Store Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingStore ? 'Edit Store' : 'Add New Store'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingStore(null);
                      setFormData({ name: '', email: '', address: '', category: '', phone: '' });
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Enter store name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="store@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="Enter complete address"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Select category</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="retail">Retail</option>
                      <option value="service">Service</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="beauty">Beauty & Wellness</option>
                      <option value="automotive">Automotive</option>
                      <option value="technology">Technology</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingStore(null);
                        setFormData({ name: '', email: '', address: '', category: '', phone: '' });
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </OwnerLayout>
  );
}
