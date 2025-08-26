import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';

/**
 * Unified authentication hook that combines AuthContext and role-based permissions
 * This provides a single source of truth for all authentication and permission checks
 */
export const useUnifiedAuth = () => {
  const auth = useAuth();
  const rolePermissions = useRoleBasedPermissions();

  // Helper functions to map granular roles to simple permissions
  const isAnyAdmin = () => {
    return rolePermissions.userRole && rolePermissions.userRole !== 'none';
  };

  const isSuperAdmin = () => {
    return rolePermissions.userRole === 'super_admin';
  };

  const isRegularAdmin = () => {
    return rolePermissions.userRole === 'admin';
  };

  const isEditor = () => {
    return rolePermissions.userRole === 'editor';
  };

  const isViewer = () => {
    return rolePermissions.userRole === 'viewer';
  };

  // Combined loading state
  const isLoadingUnified = auth.isLoading || rolePermissions.isLoading;

  return {
    // All original auth properties
    ...auth,
    
    // Enhanced role information
    userRole: rolePermissions.userRole,
    permissions: rolePermissions.permissions,
    hasPermission: rolePermissions.hasPermission,
    requirePermission: rolePermissions.requirePermission,
    getMenuVisibility: rolePermissions.getMenuVisibility,
    
    // Helper functions
    isAnyAdmin: isAnyAdmin(),
    isSuperAdmin: isSuperAdmin(),
    isRegularAdmin: isRegularAdmin(),
    isEditor: isEditor(),
    isViewer: isViewer(),
    
    // Combined loading state
    isLoadingUnified,
    
    // Role-based permission errors
    permissionError: rolePermissions.error,
  };
};