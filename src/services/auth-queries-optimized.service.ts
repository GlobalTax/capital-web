// ============= OPTIMIZED AUTH QUERIES SERVICE =============
// Enhanced auth queries with better error handling and fallbacks

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AdminStatusResult {
  isAdmin: boolean;
  role?: string;
  error?: string;
}

interface RegistrationStatusResult {
  isApproved: boolean;
  request?: any;
  error?: string;
}

// Enhanced admin status query with shorter timeout and fallback
export const useOptimizedAdminStatusQuery = (userId: string | null) => {
  return useQuery({
    queryKey: ['admin-status-optimized', userId],
    queryFn: async (): Promise<AdminStatusResult> => {
      if (!userId) return { isAdmin: false };

      try {
        // Race against timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Admin query timeout')), 2000)
        );

        const queryPromise = supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          logger.warn('Admin status query failed', error, { context: 'auth', userId });
          return { isAdmin: false, error: error.message };
        }

        const isAdmin = !!data;
        const role = data?.role;

        logger.debug('Admin status resolved', { isAdmin, role }, { context: 'auth', userId });
        return { isAdmin, role };

      } catch (error: any) {
        logger.error('Admin status query error', error, { context: 'auth', userId });
        return { isAdmin: false, error: error.message };
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('timeout')) return false;
      return failureCount < 1; // Only retry once
    },
    retryDelay: 1000,
  });
};

// Enhanced registration status query with fallback
export const useOptimizedRegistrationStatusQuery = (userId: string | null) => {
  return useQuery({
    queryKey: ['registration-status-optimized', userId],
    queryFn: async (): Promise<RegistrationStatusResult> => {
      if (!userId) return { isApproved: false };

      try {
        // Race against timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Registration query timeout')), 2000)
        );

        const queryPromise = supabase
          .from('user_registration_requests')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          logger.warn('Registration status query failed', error, { context: 'auth', userId });
          return { isApproved: false, error: error.message };
        }

        const isApproved = data?.status === 'approved';

        logger.debug('Registration status resolved', { isApproved, status: data?.status }, { context: 'auth', userId });
        return { isApproved, request: data };

      } catch (error: any) {
        logger.error('Registration status query error', error, { context: 'auth', userId });
        return { isApproved: false, error: error.message };
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error.message.includes('timeout')) return false;
      return failureCount < 1; // Only retry once
    },
    retryDelay: 1000,
  });
};

// Cached admin status for offline access
const adminStatusCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

export const getCachedAdminStatus = (userId: string): boolean | null => {
  const cached = adminStatusCache.get(userId);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    adminStatusCache.delete(userId);
    return null;
  }
  
  return cached.isAdmin;
};

export const setCachedAdminStatus = (userId: string, isAdmin: boolean) => {
  adminStatusCache.set(userId, { isAdmin, timestamp: Date.now() });
};