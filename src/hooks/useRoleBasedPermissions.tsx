import { useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isAdmin } = useAuth();
  const mountedRef = useRef(true);
  
  // Cleanup on unmount to prevent React #300 error
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Fetch user role from database with circuit breaker
  const { data: userRole, error, isLoading: queryLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AdminRole> => {
      if (!user?.id) return 'none';
      
      try {
        const { data, error } = await supabase
          .rpc('check_user_admin_role', { check_user_id: user.id });
        
        if (error) {
          console.error('RPC error:', error);
          return 'none'; // Fallback seguro
        }
        
        return (data as AdminRole) || 'none';
      } catch (error) {
        console.error('Role check failed:', error);
        return 'none'; // Fallback seguro
      }
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - más cache
    gcTime: 15 * 60 * 1000, // 15 minutes (nuevo nombre para cacheTime)
    retry: 2, // Solo 2 reintentos
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Evitar refetch automático
    refetchOnMount: false, // Evitar refetch en mount
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
    // Prevent updates after unmount
    if (!mountedRef.current) return {};
    
    // Para admins y super_admins, mostrar todo
    const isAdminLevel = userRole === 'admin' || userRole === 'super_admin';
    
    return {
      // Dashboard always visible
      dashboard: true,
      
      // Lead management - Visible para admins, editors, y viewers
      leadScoring: userRole !== 'none',
      leadScoringRules: isAdminLevel,
      contactLeads: userRole !== 'none',
      contacts: userRole !== 'none',
      contactLists: userRole !== 'none',
      collaboratorApplications: userRole !== 'none',
      alerts: userRole !== 'none',
      proposals: userRole !== 'none',
      
      // Email Marketing - Visible para admins y editors
      emailMarketing: isAdminLevel,
      
      // Content management - Visible para admins y editors
      blogV2: userRole !== 'none' && userRole !== 'viewer',
      sectorReports: userRole !== 'none' && userRole !== 'viewer',
      caseStudies: userRole !== 'none' && userRole !== 'viewer',
      leadMagnets: userRole !== 'none' && userRole !== 'viewer',
      
      // Company data - Visible para todos excepto 'none'
      operations: userRole !== 'none',
      multiples: userRole !== 'none',
      statistics: userRole !== 'none',
      
      // Team & testimonials - Visible para admins y editors
      team: userRole !== 'none' && userRole !== 'viewer',
      testimonials: userRole !== 'none' && userRole !== 'viewer',
      carouselTestimonials: userRole !== 'none' && userRole !== 'viewer',
      carouselLogos: userRole !== 'none' && userRole !== 'viewer',
      
      // Marketing & Analytics - Visible para todos excepto 'none'
      marketingAutomation: isAdminLevel,
      marketingIntelligence: userRole !== 'none',
      marketingHub: userRole !== 'none',
      integrations: isAdminLevel,
      
      // Tracking & Performance - Nuevas funcionalidades
      contentPerformance: userRole !== 'none',
      contentStudio: userRole !== 'none' && userRole !== 'viewer',
      trackingDashboard: userRole !== 'none',
      trackingConfig: isAdminLevel,
      
      // Configuration - Solo para super admins y admins respectivamente
      adminUsers: userRole === 'super_admin',
      settings: isAdminLevel,
    };
  };

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