import type { Route } from "./+types/user";
import { redirect } from "react-router";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../providers/AuthProvider';
import { UserLayout } from "~/components/UserLayout";
import UserDashboard from "~/features/user/components/UserDashboard";

export async function loader({ request }: Route.LoaderArgs) {
  // Add any authentication checks here if needed
  // For now, just return empty data since UserDashboard handles its own data loading
  return {};
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Dashboard - Quantify" },
    { name: "description", content: "User dashboard and features" },
  ];
}

export default function User() {
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
      <UserDashboard />
    </UserLayout>
  );
}