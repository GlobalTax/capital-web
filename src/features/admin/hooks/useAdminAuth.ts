import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';
import type { AdminUser } from '../types';

export const useAdminAuth = () => {
  const { user, isAdmin, isLoading, signOut } = useAuth();

  const adminUser: AdminUser | null = useMemo(() => {
    if (!user || !isAdmin) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: 'admin', // Could be enhanced with actual role detection
      permissions: [], // Could be enhanced with actual permissions
      created_at: user.created_at || new Date().toISOString(),
    };
  }, [user, isAdmin]);

  return {
    adminUser,
    isAdmin,
    isLoading,
    signOut,
    isAuthenticated: !!adminUser
  };
};