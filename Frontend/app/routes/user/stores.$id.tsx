import React, { useEffect } from 'react';
import { useParams } from "react-router";
import toast from 'react-hot-toast';
import { useAuth } from '~/providers/AuthProvider';
import { UserLayout } from "~/components/UserLayout";
import StoreDetail from "~/features/user/components/StoreDetail";

export async function loader() {
  // Return empty data since StoreDetail handles its own data loading
  return {};
}

export function meta() {
  return [
    { title: "Store Details - Quantify" },
    { name: "description", content: "View store details and reviews" },
  ];
}

export default function StoreDetailPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    // Check if user has user role
    if (!authLoading && isAuthenticated && user && user.role !== 'USER') {
      toast.error('Access denied. User privileges required.');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, authLoading, user]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Don't render if not user (will redirect)
  if (user.role !== 'USER') {
    return null;
  }
  
  if (!id) {
    return (
      <UserLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Store not found</h1>
          <p className="text-gray-600 mt-2">The store you're looking for doesn't exist.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <StoreDetail storeId={parseInt(id)} />
    </UserLayout>
  );
}
