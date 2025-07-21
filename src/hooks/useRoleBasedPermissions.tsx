import { useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQuery } from './useOptimizedQuery';

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
    canManageUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewUsers: true,
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canPublishContent: true,
    canManageLeads: true,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: true,
    canExportLeads: true,
    canViewAnalytics: true,
    canViewAdvancedAnalytics: true,
    canCreateReports: true,
    canExportReports: true,
    canManageSettings: true,
    canManageIntegrations: true,
    canViewSystemLogs: true,
    canManageWorkflows: true,
    canManageMarketing: true,
    canManageCampaigns: true,
    canViewMarketingIntelligence: true,
    canManageOperations: true,
    canViewFinancials: true,
    canManageTeam: true,
  },
  admin: {
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: true,
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canPublishContent: true,
    canManageLeads: true,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canExportLeads: true,
    canViewAnalytics: true,
    canViewAdvancedAnalytics: true,
    canCreateReports: true,
    canExportReports: true,
    canManageSettings: false,
    canManageIntegrations: true,
    canViewSystemLogs: true,
    canManageWorkflows: true,
    canManageMarketing: true,
    canManageCampaigns: true,
    canViewMarketingIntelligence: true,
    canManageOperations: true,
    canViewFinancials: true,
    canManageTeam: true,
  },
  editor: {
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewUsers: false,
    canManageContent: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: false,
    canPublishContent: false,
    canManageLeads: false,
    canViewLeads: true,
    canEditLeads: true,
    canDeleteLeads: false,
    canExportLeads: false,
    canViewAnalytics: true,
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
  viewer: {
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
    canViewLeads: true,
    canEditLeads: false,
    canDeleteLeads: false,
    canExportLeads: false,
    canViewAnalytics: true,
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

// Placeholder data para permisos
const DEFAULT_PERMISSIONS_PLACEHOLDER: RolePermissions = ROLE_PERMISSIONS.viewer;

export const useRoleBasedPermissions = () => {
  const { user, isAdmin } = useAuth();
  const mountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Fetch user role optimizado con cache persistente
  const { data: userRole, error, isLoading: queryLoading } = useOptimizedQuery(
    ['user-role', user?.id],
    async (): Promise<AdminRole> => {
      if (!user?.id) return 'none';
      
      try {
        const { data, error } = await supabase
          .rpc('check_user_admin_role', { check_user_id: user.id });
        
        if (error) {
          console.error('RPC error:', error);
          return 'none';
        }
        
        return (data as AdminRole) || 'none';
      } catch (error) {
        console.error('Role check failed:', error);
        return 'none';
      }
    },
    'persistent', // Cache persistente para roles
    {
      enabled: !!user?.id,
      placeholderData: 'none' as AdminRole,
      select: (data) => data || 'none'
    }
  );

  const permissions = useMemo(() => {
    if (!mountedRef.current) return DEFAULT_PERMISSIONS_PLACEHOLDER;
    
    const role = userRole || 'none';
    return ROLE_PERMISSIONS[role];
  }, [userRole]);

  const hasPermission = useMemo(() => 
    (permission: keyof RolePermissions): boolean => {
      return permissions[permission] || false;
    }, [permissions]
  );

  const requirePermission = useMemo(() => 
    (permission: keyof RolePermissions, fallback?: () => void) => {
      if (!hasPermission(permission)) {
        if (fallback) {
          fallback();
          return false;
        }
        throw new Error(`Permission denied: ${permission}`);
      }
      return true;
    }, [hasPermission]
  );

  const getMenuVisibility = useMemo(() => () => {
    if (!mountedRef.current) return {};
    
    const isAdminLevel = userRole === 'admin' || userRole === 'super_admin';
    
    return {
      dashboard: true,
      leadScoring: userRole !== 'none',
      leadScoringRules: isAdminLevel,
      contactLeads: userRole !== 'none',
      contacts: userRole !== 'none',
      contactLists: userRole !== 'none',
      collaboratorApplications: userRole !== 'none',
      alerts: userRole !== 'none',
      proposals: userRole !== 'none',
      emailMarketing: isAdminLevel,
      blogV2: userRole !== 'none' && userRole !== 'viewer',
      sectorReports: userRole !== 'none' && userRole !== 'viewer',
      caseStudies: userRole !== 'none' && userRole !== 'viewer',
      leadMagnets: userRole !== 'none' && userRole !== 'viewer',
      landingPages: userRole !== 'none' && userRole !== 'viewer',
      designResources: userRole !== 'none' && userRole !== 'viewer',
      operations: userRole !== 'none',
      multiples: userRole !== 'none',
      statistics: userRole !== 'none',
      team: userRole !== 'none' && userRole !== 'viewer',
      testimonials: userRole !== 'none' && userRole !== 'viewer',
      carouselTestimonials: userRole !== 'none' && userRole !== 'viewer',
      carouselLogos: userRole !== 'none' && userRole !== 'viewer',
      marketingAutomation: isAdminLevel,
      marketingIntelligence: userRole !== 'none',
      marketingHub: userRole !== 'none',
      integrations: isAdminLevel,
      contentPerformance: userRole !== 'none',
      contentStudio: userRole !== 'none' && userRole !== 'viewer',
      trackingDashboard: userRole !== 'none',
      trackingConfig: isAdminLevel,
      adminUsers: userRole === 'super_admin',
      settings: isAdminLevel,
    };
  }, [userRole]);

  return {
    permissions,
    userRole: userRole || 'none',
    hasPermission,
    requirePermission,
    getMenuVisibility,
    isLoading: queryLoading && !!user?.id,
    error,
  };
};
