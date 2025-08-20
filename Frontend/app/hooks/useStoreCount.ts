import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { ownerApiService } from '../features/owner/services/owner.api';

export function useStoreCount() {
  const { user } = useAuth();
  const [storeCount, setStoreCount] = useState(0);
  const [storeLimit] = useState(2);

  const fetchStoreCount = useCallback(async () => {
    if (user?.id && user?.role === 'OWNER') {
      try {
        const dashboardStats = await ownerApiService.getDashboardStats(user.id);
        setStoreCount(dashboardStats.totalStores);
      } catch (error) {
        console.error('Error fetching store count:', error);
        setStoreCount(0);
      }
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchStoreCount();
    
    // Refresh store count every 30 seconds to keep it up-to-date
    const interval = setInterval(fetchStoreCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStoreCount]);

  // Return refresh function for manual updates
  return { storeCount, storeLimit, refreshStoreCount: fetchStoreCount };
}
