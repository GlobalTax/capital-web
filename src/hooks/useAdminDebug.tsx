import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedPermissions } from './useRoleBasedPermissions';

export const useAdminDebug = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { userRole, permissions, isLoading: permissionsLoading } = useRoleBasedPermissions();

  useEffect(() => {
    if (!authLoading && !permissionsLoading) {
      console.log('🔍 Admin Debug Info:', {
        user: {
          id: user?.id,
          email: user?.email,
          authenticated: !!user
        },
        auth: {
          isAdmin,
          authLoading
        },
        permissions: {
          userRole,
          permissionsLoading,
          canViewLeads: permissions.canViewLeads,
          canManageContent: permissions.canManageContent,
          canManageUsers: permissions.canManageUsers
        }
      });
    }
  }, [user, isAdmin, authLoading, userRole, permissions, permissionsLoading]);

  return {
    debugInfo: {
      user,
      isAdmin,
      userRole,
      permissions,
      authLoading,
      permissionsLoading
    }
  };
};