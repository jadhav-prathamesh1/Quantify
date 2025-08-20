import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../providers/AuthProvider';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role.toLowerCase()) {
        case 'admin':
          navigate('/admin');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'user':
          navigate('/user');
          break;
        default:
          navigate('/login');
      }
    } else if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
