
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedPermissions } from './useRoleBasedPermissions';
import { logger } from '@/utils/logger';

export const useAdminDebug = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { userRole, permissions, isLoading: permissionsLoading } = useRoleBasedPermissions();

  useEffect(() => {
    if (!authLoading && !permissionsLoading) {
      logger.debug('Admin debug info', {
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
      }, { context: 'admin', component: 'useAdminDebug' });
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
