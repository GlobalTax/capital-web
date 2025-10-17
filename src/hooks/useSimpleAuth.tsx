import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdminRole = 'super_admin' | 'admin' | 'viewer' | null;

export interface SimplePermissions {
  // Admin Panel Access
  canAccessAdmin: boolean;
  
  // User Management (solo super_admin)
  canManageUsers: boolean;
  
  // Content (admin + super_admin)
  canEditContent: boolean;
  canPublishContent: boolean;
  
  // Leads (admin + super_admin)
  canViewLeads: boolean;
  canEditLeads: boolean;
  canExportLeads: boolean;
  
  // Analytics (todos los autenticados)
  canViewBasicAnalytics: boolean;
  canViewAdvancedAnalytics: boolean; // solo admin+
  
  // Settings (solo super_admin)
  canManageSettings: boolean;
  canManageIntegrations: boolean;
  canViewAuditLogs: boolean;
}

const getPermissionsForRole = (role: AdminRole): SimplePermissions => {
  if (role === 'super_admin') {
    return {
      canAccessAdmin: true,
      canManageUsers: true,
      canEditContent: true,
      canPublishContent: true,
      canViewLeads: true,
      canEditLeads: true,
      canExportLeads: true,
      canViewBasicAnalytics: true,
      canViewAdvancedAnalytics: true,
      canManageSettings: true,
      canManageIntegrations: true,
      canViewAuditLogs: true,
    };
  }
  
  if (role === 'admin') {
    return {
      canAccessAdmin: true,
      canManageUsers: false,
      canEditContent: true,
      canPublishContent: true,
      canViewLeads: true,
      canEditLeads: true,
      canExportLeads: true,
      canViewBasicAnalytics: true,
      canViewAdvancedAnalytics: true,
      canManageSettings: false,
      canManageIntegrations: false,
      canViewAuditLogs: false,
    };
  }
  
  if (role === 'viewer') {
    return {
      canAccessAdmin: true,
      canManageUsers: false,
      canEditContent: false,
      canPublishContent: false,
      canViewLeads: true,
      canEditLeads: false,
      canExportLeads: false,
      canViewBasicAnalytics: true,
      canViewAdvancedAnalytics: false,
      canManageSettings: false,
      canManageIntegrations: false,
      canViewAuditLogs: false,
    };
  }
  
  // No role = no permissions
  return {
    canAccessAdmin: false,
    canManageUsers: false,
    canEditContent: false,
    canPublishContent: false,
    canViewLeads: false,
    canEditLeads: false,
    canExportLeads: false,
    canViewBasicAnalytics: false,
    canViewAdvancedAnalytics: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewAuditLogs: false,
  };
};

export const useSimpleAuth = () => {
  const { user, session, isLoading: authLoading } = useAuth();
  
  const { data: role, isLoading: roleLoading } = useQuery<AdminRole>({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error || !data || !data.is_active) {
        return null;
      }
      
      return data.role as AdminRole;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  const permissions = getPermissionsForRole(role);
  
  return {
    // Role checks
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
    isViewer: role === 'viewer',
    isAuthenticated: !!user && !!session,
    
    // Granular permissions
    ...permissions,
    
    // Loading states
    isLoading: authLoading || roleLoading,
    
    // Helper function
    hasPermission: (permission: keyof SimplePermissions) => permissions[permission],
  };
};
