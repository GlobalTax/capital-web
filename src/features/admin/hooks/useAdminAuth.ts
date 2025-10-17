import { useAdminAuth as useRobustAdminAuth } from '@/hooks/useAdminAuth';
import { useMemo } from 'react';
import type { AdminUser } from '../types';

/**
 * Wrapper para mantener compatibilidad con el sistema legacy de admin
 * Usa el nuevo sistema robusto de autenticación por debajo
 */
export const useAdminAuth = () => {
  const { user, isAdmin, isLoading, signOut, role } = useRobustAdminAuth();

  const adminUser: AdminUser | null = useMemo(() => {
    if (!user || !isAdmin) return null;
    
    return {
      id: user.id,
      email: user.email || '',
      role: role === 'none' ? 'admin' : (role as any), // Map role correctly
      permissions: [], // Could be enhanced with actual permissions
      created_at: user.created_at || new Date().toISOString(),
    };
  }, [user, isAdmin, role]);

  return {
    adminUser,
    isAdmin,
    isLoading,
    signOut,
    isAuthenticated: !!adminUser
  };
};