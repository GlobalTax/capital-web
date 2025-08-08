import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentLogins: number;
  popularPages: Array<{ page: string; visits: number; }>;
  userGrowth: Array<{ date: string; count: number; }>;
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    uptime: number;
  };
  systemHealth: {
    databaseConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    diskSpace: number;
  };
}

interface UseAdminAnalyticsReturn {
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  getDateRangeAnalytics: (startDate: Date, endDate: Date) => Promise<AdminAnalytics | null>;
}

export const useAdminAnalytics = (): UseAdminAnalyticsReturn => {
  const { user, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (startDate?: Date, endDate?: Date): Promise<AdminAnalytics | null> => {
    if (!isAdmin) {
      setError('Acceso denegado: Se requieren permisos de administrador');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Simulated analytics data - in a real app, this would come from your analytics service
      const mockAnalytics: AdminAnalytics = {
        totalUsers: 1250,
        activeUsers: 342,
        adminUsers: 8,
        recentLogins: 45,
        popularPages: [
          { page: '/admin/dashboard', visits: 234 },
          { page: '/admin/leads', visits: 189 },
          { page: '/admin/users', visits: 156 },
          { page: '/admin/content', visits: 98 },
          { page: '/admin/settings', visits: 67 }
        ],
        userGrowth: generateMockGrowthData(),
        performanceMetrics: {
          averageLoadTime: 1.2,
          errorRate: 0.02,
          uptime: 99.9
        },
        systemHealth: {
          databaseConnections: 45,
          memoryUsage: 68,
          cpuUsage: 23,
          diskSpace: 78
        }
      };

      // Real data fetching would happen here
      const { data: adminUsersData, error: adminUsersError } = await supabase
        .from('admin_users')
        .select('id, is_active, last_login, created_at');

      if (adminUsersError) {
        throw adminUsersError;
      }

      // Update mock data with real admin users count
      if (adminUsersData) {
        mockAnalytics.adminUsers = adminUsersData.length;
        mockAnalytics.activeUsers = adminUsersData.filter(u => u.is_active).length;
        
        // Count recent logins (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        mockAnalytics.recentLogins = adminUsersData.filter(u => 
          u.last_login && new Date(u.last_login) > yesterday
        ).length;
      }

      setAnalytics(mockAnalytics);
      return mockAnalytics;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Failed to fetch admin analytics', err as Error, { 
        context: 'auth',
        userId: user?.id
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user?.id]);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  const getDateRangeAnalytics = useCallback(async (startDate: Date, endDate: Date) => {
    return fetchAnalytics(startDate, endDate);
  }, [fetchAnalytics]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
    getDateRangeAnalytics
  };
};

// Helper function to generate mock growth data
function generateMockGrowthData() {
  const data = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 800 + i * 2 // Trending upward
    });
  }
  
  return data;
}