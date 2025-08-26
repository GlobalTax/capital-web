// ============= ADMIN OPERATIONS HOOK =============
// Consolidated admin operations and CRUD functionality

import { useCallback } from 'react';
import { useApi } from '@/shared/hooks/useApi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks';
import type { AdminUser, AdminRole } from '@/shared/types';

export const useAdminOperations = () => {
  const { toast } = useToast();
  const api = useApi({
    onError: (error) => toast({
      title: "Error",
      description: error,
      variant: "destructive"
    })
  });

  // User Management
  const getUsers = useCallback(async () => {
    return api.execute(async () => {
      const result = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      return result;
    });
  }, [api]);

  const createUser = useCallback(async (userData: {
    email: string;
    fullName: string;
    role: AdminRole;
  }) => {
    return api.execute(async () => {
      const result = await supabase.functions.invoke('create-admin-user', {
        body: userData
      });
      return result;
    });
  }, [api]);

  const updateUser = useCallback(async (userId: string, updates: Partial<AdminUser>) => {
    return api.execute(async () => {
      const result = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', userId);
      return result;
    });
  }, [api]);

  const deleteUser = useCallback(async (userId: string) => {
    return api.execute(async () => {
      const result = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('id', userId);
      return result;
    });
  }, [api]);

  return {
    // API state
    isLoading: api.isLoading,
    error: api.error,
    data: api.data,
    
    // User operations
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // Utility
    reset: api.reset,
  };
};