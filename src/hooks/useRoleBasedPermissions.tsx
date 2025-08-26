import { useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

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
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef<number>(0);
  
  // Cleanup on unmount to prevent React #300 error
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Circuit breaker: if too many errors in short time, go to safe mode
  const isCircuitBreakerOpen = () => {
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTimeRef.current;
    
    // Reset counter if more than 5 minutes passed
    if (timeSinceLastError > 5 * 60 * 1000) {
      errorCountRef.current = 0;
    }
    
    // Open circuit if 3+ errors in 5 minutes
    return errorCountRef.current >= 3;
  };

  const recordError = () => {
    errorCountRef.current += 1;
    lastErrorTimeRef.current = Date.now();
  };
  
  // Fetch user role from database with enhanced circuit breaker
  const { data: userRole, error, isLoading: queryLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AdminRole> => {
      // Guard against undefined/null user
      if (!user?.id || typeof user.id !== 'string') {
        return 'none';
      }
      
      // Circuit breaker: if too many failures, return safe fallback
      if (isCircuitBreakerOpen()) {
        logger.warn('Role check circuit breaker open, returning safe fallback', {
          context: 'system',
          component: 'useRoleBasedPermissions',
          data: { errorCount: errorCountRef.current }
        });
        return 'none';
      }
      
      try {
        // Timeout after 10 seconds to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('RPC timeout')), 10000);
        });
        
        const rpcPromise = supabase
          .rpc('check_user_admin_role', { check_user_id: user.id });
        
        const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);
        
        if (error) {
          recordError();
          logger.error('RPC error in role check', error, {
            context: 'system',
            component: 'useRoleBasedPermissions',
            data: { userId: user.id, errorCode: error.code }
          });
          return 'none';
        }
        
        // Validate response is a valid role
        const validRoles: AdminRole[] = ['super_admin', 'admin', 'editor', 'viewer', 'none'];
        const role = data as AdminRole;
        
        if (!validRoles.includes(role)) {
          logger.warn('Invalid role returned from RPC', {
            context: 'system',
            component: 'useRoleBasedPermissions',
            data: { receivedRole: role, userId: user.id }
          });
          return 'none';
        }
        
        return role;
      } catch (error) {
        recordError();
        logger.error('Role check failed completely', error as Error, {
          context: 'system',
          component: 'useRoleBasedPermissions',
          data: { 
            userId: user.id,
            errorType: error instanceof Error ? error.name : 'Unknown',
            isTimeout: error instanceof Error && error.message.includes('timeout')
          }
        });
        return 'none';
      }
    },
    enabled: !!user?.id && !isCircuitBreakerOpen(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: (failureCount, error) => {
      // Don't retry if circuit breaker is open
      if (isCircuitBreakerOpen()) return false;
      // Don't retry timeout errors more than once
      if (error?.message?.includes('timeout') && failureCount >= 1) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const permissions = useMemo(() => {
    // Always ensure we have a valid role
    const role = (userRole && userRole in ROLE_PERMISSIONS) ? userRole : 'none';
    const rolePermissions = ROLE_PERMISSIONS[role];
    
    // Extra safety: ensure permissions object exists
    if (!rolePermissions) {
      logger.error('Missing role permissions configuration', new Error('Invalid role permissions'), {
        context: 'system',
        component: 'useRoleBasedPermissions',
        data: { role, userRole }
      });
      return ROLE_PERMISSIONS.none;
    }
    
    return rolePermissions;
  }, [userRole]);

  const hasPermission = (permission: keyof RolePermissions): boolean => {
    try {
      // Guard against invalid permissions object
      if (!permissions || typeof permissions !== 'object') {
        return false;
      }
      
      // Guard against invalid permission key
      if (!(permission in permissions)) {
        logger.warn('Unknown permission requested', {
          context: 'system',
          component: 'useRoleBasedPermissions',
          data: { permission, availablePermissions: Object.keys(permissions) }
        });
        return false;
      }
      
      return Boolean(permissions[permission]);
    } catch (error) {
      logger.error('Error checking permission', error as Error, {
        context: 'system',
        component: 'useRoleBasedPermissions',
        data: { permission, userRole }
      });
      return false;
    }
  };

  const requirePermission = (permission: keyof RolePermissions, fallback?: () => void): boolean => {
    const hasAccess = hasPermission(permission);
    
    if (!hasAccess) {
      if (fallback) {
        try {
          fallback();
        } catch (error) {
          logger.error('Error executing permission fallback', error as Error, {
            context: 'system',
            component: 'useRoleBasedPermissions',
            data: { permission }
          });
        }
      }
      return false;
    }
    
    return true;
  };

  const getMenuVisibility = () => {
    try {
      // Prevent updates after unmount
      if (!mountedRef.current) {
        return getEmergencyFallbackMenu();
      }
      
      // Validate userRole is a known value
      const safeUserRole = (userRole && userRole in ROLE_PERMISSIONS) ? userRole : 'none';
      const isAdminLevel = safeUserRole === 'admin' || safeUserRole === 'super_admin';
      
      return {
        // Dashboard always visible (emergency fallback)
        dashboard: true,
        
        // Lead management - Visible para admins, editors, y viewers
        leadScoring: safeUserRole !== 'none',
        leadScoringRules: isAdminLevel,
        contactLeads: safeUserRole !== 'none',
        contacts: safeUserRole !== 'none',
        contactLists: safeUserRole !== 'none',
        collaboratorApplications: safeUserRole !== 'none',
        alerts: safeUserRole !== 'none',
        proposals: safeUserRole !== 'none',
        
        // Email Marketing - Visible para admins y editors
        emailMarketing: isAdminLevel,
        
        // Content management - Visible para admins y editors
        blogV2: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        sectorReports: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        caseStudies: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        leadMagnets: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        landingPages: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        designResources: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        
        // Company data - Visible para todos excepto 'none'
        operations: safeUserRole !== 'none',
        multiples: safeUserRole !== 'none',
        statistics: safeUserRole !== 'none',
        
        // Team & testimonials - Visible para admins y editors
        team: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        testimonials: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        carouselTestimonials: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        carouselLogos: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        
        // Marketing & Analytics - Visible para todos excepto 'none'
        marketingAutomation: isAdminLevel,
        marketingIntelligence: safeUserRole !== 'none',
        marketingHub: safeUserRole !== 'none',
        integrations: isAdminLevel,
        
        // Tracking & Performance - Nuevas funcionalidades
        contentPerformance: safeUserRole !== 'none',
        contentStudio: safeUserRole !== 'none' && safeUserRole !== 'viewer',
        trackingDashboard: safeUserRole !== 'none',
        trackingConfig: isAdminLevel,
        
        // Configuration - Solo para super admins y admins respectivamente
        adminUsers: safeUserRole === 'super_admin',
        settings: isAdminLevel,
      };
    } catch (error) {
      logger.error('Error calculating menu visibility', error as Error, {
        context: 'system',
        component: 'useRoleBasedPermissions',
        data: { userRole }
      });
      return getEmergencyFallbackMenu();
    }
  };

  // Emergency fallback menu - only dashboard visible
  const getEmergencyFallbackMenu = () => ({
    dashboard: true,
    // All other menu items hidden for safety
    leadScoring: false,
    leadScoringRules: false,
    contactLeads: false,
    contacts: false,
    contactLists: false,
    collaboratorApplications: false,
    alerts: false,
    proposals: false,
    emailMarketing: false,
    blogV2: false,
    sectorReports: false,
    caseStudies: false,
    leadMagnets: false,
    landingPages: false,
    designResources: false,
    operations: false,
    multiples: false,
    statistics: false,
    team: false,
    testimonials: false,
    carouselTestimonials: false,
    carouselLogos: false,
    marketingAutomation: false,
    marketingIntelligence: false,
    marketingHub: false,
    integrations: false,
    contentPerformance: false,
    contentStudio: false,
    trackingDashboard: false,
    trackingConfig: false,
    adminUsers: false,
    settings: false,
  });

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