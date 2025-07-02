import { useMemo } from 'react';
import { useAdminAuth } from './useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// IMPORTANTE: Este archivo está llegando a ser muy largo (349 líneas).
// Considera refactorizar en archivos separados después de completar la implementación.

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer' | 'none';

interface RolePermissions {
  // User Management
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewUsers: boolean;
  
  // Content Management
  canManageContent: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  
  // Lead Management
  canManageLeads: boolean;
  canViewLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canExportLeads: boolean;
  
  // Analytics & Reports
  canViewAnalytics: boolean;
  canViewAdvancedAnalytics: boolean;
  canCreateReports: boolean;
  canExportReports: boolean;
  
  // System Configuration
  canManageSettings: boolean;
  canManageIntegrations: boolean;
  canViewSystemLogs: boolean;
  canManageWorkflows: boolean;
  
  // Marketing Tools
  canManageMarketing: boolean;
  canManageCampaigns: boolean;
  canViewMarketingIntelligence: boolean;
  
  // Operations
  canManageOperations: boolean;
  canViewFinancials: boolean;
  canManageTeam: boolean;
}

const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  super_admin: {
    // User Management - Full access
    canManageUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewUsers: true,
    
    // Content Management - Full access
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canPublishContent: true,
    
    // Lead Management - Full access
    canManageLeads: true,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: true,
    canExportLeads: true,
    
    // Analytics & Reports - Full access
    canViewAnalytics: true,
    canViewAdvancedAnalytics: true,
    canCreateReports: true,
    canExportReports: true,
    
    // System Configuration - Full access
    canManageSettings: true,
    canManageIntegrations: true,
    canViewSystemLogs: true,
    canManageWorkflows: true,
    
    // Marketing Tools - Full access
    canManageMarketing: true,
    canManageCampaigns: true,
    canViewMarketingIntelligence: true,
    
    // Operations - Full access
    canManageOperations: true,
    canViewFinancials: true,
    canManageTeam: true,
  },
  
  admin: {
    // User Management - No access (only super_admin)
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: true, // Can view but not modify
    
    // Content Management - Full access
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canPublishContent: true,
    
    // Lead Management - Full access
    canManageLeads: true,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: false, // Can't delete, only archive
    canExportLeads: true,
    
    // Analytics & Reports - Full access
    canViewAnalytics: true,
    canViewAdvancedAnalytics: true,
    canCreateReports: true,
    canExportReports: true,
    
    // System Configuration - Limited access
    canManageSettings: false,
    canManageIntegrations: true,
    canViewSystemLogs: true,
    canManageWorkflows: true,
    
    // Marketing Tools - Full access
    canManageMarketing: true,
    canManageCampaigns: true,
    canViewMarketingIntelligence: true,
    
    // Operations - Full access
    canManageOperations: true,
    canViewFinancials: true,
    canManageTeam: true,
  },
  
  editor: {
    // User Management - No access
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: false,
    
    // Content Management - Create and edit only
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canPublishContent: false, // Can create but needs approval
    
    // Lead Management - View and edit only
    canManageLeads: false,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canExportLeads: false,
    
    // Analytics & Reports - View only
    canViewAnalytics: true,
    canViewAdvancedAnalytics: false,
    canCreateReports: false,
    canExportReports: false,
    
    // System Configuration - No access
    canManageSettings: false,
    canManageIntegrations: false,
    canViewSystemLogs: false,
    canManageWorkflows: false,
    
    // Marketing Tools - Limited access
    canManageMarketing: false,
    canManageCampaigns: false,
    canViewMarketingIntelligence: false,
    
    // Operations - View only
    canManageOperations: false,
    canViewFinancials: false,
    canManageTeam: false,
  },
  
  viewer: {
    // All permissions false - read-only access via specific components
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: false,
    
    canManageContent: false,
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canPublishContent: false,
    
    canManageLeads: false,
    canViewLeads: true, // Basic lead viewing
    canEditLeads: false,
    canDeleteLeads: false,
    canExportLeads: false,
    
    canViewAnalytics: true, // Basic analytics only
    canViewAdvancedAnalytics: false,
    canCreateReports: false,
    canExportReports: false,
    
    canManageSettings: false,
    canManageIntegrations: false,
    canViewSystemLogs: false,
    canManageWorkflows: false,
    
    canManageMarketing: false,
    canManageCampaigns: false,
    canViewMarketingIntelligence: false,
    
    canManageOperations: false,
    canViewFinancials: false,
    canManageTeam: false,
  },
  
  none: {
    // No permissions
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: false,
    canManageContent: false,
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canPublishContent: false,
    canManageLeads: false,
    canViewLeads: false,
    canEditLeads: false,
    canDeleteLeads: false,
    canExportLeads: false,
    canViewAnalytics: false,
    canViewAdvancedAnalytics: false,
    canCreateReports: false,
    canExportReports: false,
    canManageSettings: false,
    canManageIntegrations: false,
    canViewSystemLogs: false,
    canManageWorkflows: false,
    canManageMarketing: false,
    canManageCampaigns: false,
    canViewMarketingIntelligence: false,
    canManageOperations: false,
    canViewFinancials: false,
    canManageTeam: false,
  }
};

export const useRoleBasedPermissions = () => {
  const { user, isAdmin } = useAdminAuth();
  
  // Fetch user role from database
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AdminRole> => {
      if (!user?.id) return 'none';
      
      const { data } = await supabase
        .rpc('check_user_admin_role', { check_user_id: user.id });
      
      return (data as AdminRole) || 'none';
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const permissions = useMemo(() => {
    const role = userRole || 'none';
    return ROLE_PERMISSIONS[role];
  }, [userRole]);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    return permissions[permission] || false;
  };

  const requirePermission = (permission: keyof RolePermissions, fallback?: () => void) => {
    if (!hasPermission(permission)) {
      if (fallback) {
        fallback();
        return false;
      }
      throw new Error(`Permission denied: ${permission}`);
    }
    return true;
  };

  const getMenuVisibility = () => {
    return {
      // Dashboard always visible
      dashboard: true,
      
      // Lead management
      leadScoring: permissions.canViewLeads,
      leadScoringRules: permissions.canManageLeads,
      contactLeads: permissions.canViewLeads,
      collaboratorApplications: permissions.canViewLeads,
      alerts: permissions.canViewLeads,
      
      // Content management
      blogV2: permissions.canManageContent,
      sectorReports: permissions.canManageContent,
      caseStudies: permissions.canManageContent,
      leadMagnets: permissions.canManageContent,
      
      // Company data
      operations: permissions.canManageOperations,
      multiples: permissions.canManageOperations,
      statistics: permissions.canViewAnalytics,
      
      // Team & testimonials
      team: permissions.canManageTeam,
      testimonials: permissions.canManageContent,
      carouselTestimonials: permissions.canManageContent,
      carouselLogos: permissions.canManageContent,
      
      // Marketing & Analytics
      marketingAutomation: permissions.canManageMarketing,
      marketingIntelligence: permissions.canViewMarketingIntelligence,
      marketingHub: permissions.canViewAnalytics,
      integrations: permissions.canManageIntegrations,
      
      // Configuration
      adminUsers: permissions.canManageUsers,
      settings: permissions.canManageSettings,
    };
  };

  return {
    permissions,
    userRole: userRole || 'none',
    hasPermission,
    requirePermission,
    getMenuVisibility,
    isLoading: !userRole && !!user?.id,
  };
};