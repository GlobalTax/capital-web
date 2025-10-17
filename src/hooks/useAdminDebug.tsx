
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { logger } from '@/utils/logger';

export const useAdminDebug = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { role, isLoading: permissionsLoading, canViewLeads, canEditContent, canManageUsers } = useSimpleAuth();

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
          userRole: role,
          permissionsLoading,
          canViewLeads,
          canManageContent: canEditContent,
          canManageUsers
        }
      }, { context: 'admin', component: 'useAdminDebug' });
    }
  }, [user, isAdmin, authLoading, userRole, permissions, permissionsLoading]);

  return {
    debugInfo: {
      user,
      isAdmin,
      userRole: role,
      permissions: { canViewLeads, canEditContent, canManageUsers },
      authLoading,
      permissionsLoading
    }
  };
};
