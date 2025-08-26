import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Centralized query keys
export const AUTH_QUERY_KEYS = {
  adminStatus: (userId: string) => ['admin-status', userId],
  registrationStatus: (userId: string) => ['registration-status', userId],
  adminUsers: () => ['admin-users'],
  registrationRequests: () => ['registration-requests'],
} as const;

// Enhanced rate limiting configuration to prevent infinite loops
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10000; // Increased to 10 seconds
const MAX_REQUESTS_PER_WINDOW = 2; // Reduced to 2 requests max

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const lastCall = rateLimitMap.get(key);
  
  if (lastCall && (now - lastCall) < RATE_LIMIT_WINDOW) {
    console.warn(`Rate limited: ${key}`);
    return false; // Rate limited
  }
  
  rateLimitMap.set(key, now);
  return true; // Allow call
};

// Admin status query
export const useAdminStatusQuery = (userId?: string | null) => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.adminStatus(userId || ''),
    queryFn: async () => {
      if (!userId) return { isAdmin: false, adminData: null };
      
      if (!checkRateLimit(`admin-status-${userId}`)) {
        throw new Error('Rate limited');
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('id, is_active, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isAdmin = !!data?.is_active;
      return { isAdmin, adminData: data };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error?.message === 'Rate limited') return false;
      if (error?.status === 404 || error?.status === 403) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Registration status query
export const useRegistrationStatusQuery = (userId?: string | null) => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.registrationStatus(userId || ''),
    queryFn: async () => {
      if (!userId) return { request: null, isApproved: false };
      
      if (!checkRateLimit(`registration-status-${userId}`)) {
        throw new Error('Rate limited');
      }

      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('id, status, requested_at, rejection_reason')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const isApproved = data?.status === 'approved';
      return { request: data, isApproved };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.message === 'Rate limited') return false;
      if (error?.status === 404 || error?.status === 403) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Registration requests query (for admin use)
export const useRegistrationRequestsQuery = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.registrationRequests(),
    queryFn: async () => {
      if (!checkRateLimit('registration-requests')) {
        throw new Error('Rate limited');
      }

      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.message === 'Rate limited') return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Admin users query
export const useAdminUsersQuery = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.adminUsers(),
    queryFn: async () => {
      if (!checkRateLimit('admin-users')) {
        throw new Error('Rate limited');
      }

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.message === 'Rate limited') return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Mutation hooks for admin actions
export const useApproveRegistrationMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('approve_user_registration', {
        request_id: requestId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.registrationRequests() });
      queryClient.invalidateQueries({ queryKey: ['admin-status'] });
      toast({
        title: "Solicitud aprobada",
        description: "El usuario ha sido aprobado y puede acceder al sistema",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al aprobar la solicitud",
        variant: "destructive",
      });
    }
  });
};

export const useRejectRegistrationMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason?: string }) => {
      const { error } = await supabase.rpc('reject_user_registration', {
        request_id: requestId,
        reason: reason
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.registrationRequests() });
      toast({
        title: "Solicitud rechazada",
        description: "El usuario ha sido notificado del rechazo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al rechazar la solicitud",
        variant: "destructive",
      });
    }
  });
};