import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '~/providers/AuthProvider';
import { UserLayout } from "~/components/UserLayout";
import UserReviews from "~/features/user/components/UserReviews";

export async function loader() {
  // Return empty data since UserReviews handles its own data loading
  return {};
}

export function meta() {
  return [
    { title: "My Reviews - Quantify" },
    { name: "description", content: "Manage your reviews and ratings" },
  ];
}

export default function UserReviewsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

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

  return (
    <UserLayout>
      <UserReviews />
    </UserLayout>
  );
}
