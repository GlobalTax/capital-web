import { useState, useEffect, useMemo } from 'react';
import { useRoleBasedPermissions } from './useRoleBasedPermissions';

// Importar las interfaces de permisos
interface RolePermissions {
  canManageUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewUsers: boolean;
  canManageContent: boolean;
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  canManageLeads: boolean;
  canViewLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canExportLeads: boolean;
  canViewAnalytics: boolean;
  canViewAdvancedAnalytics: boolean;
  canCreateReports: boolean;
  canExportReports: boolean;
  canManageSettings: boolean;
  canManageIntegrations: boolean;
  canViewSystemLogs: boolean;
  canManageWorkflows: boolean;
  canManageMarketing: boolean;
  canManageCampaigns: boolean;
  canViewMarketingIntelligence: boolean;
  canManageOperations: boolean;
  canViewFinancials: boolean;
  canManageTeam: boolean;
}

const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
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

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text' | 'alert';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
  permissions: string[];
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  columns: number;
  role: string;
}

const defaultLayouts: Record<string, DashboardLayout> = {
  super_admin: {
    id: 'super_admin_default',
    name: 'Dashboard Super Admin',
    role: 'super_admin',
    columns: 3,
    widgets: [
      {
        id: 'total-users',
        type: 'kpi',
        title: 'Total Usuarios',
        size: 'small',
        config: { metric: 'total_users', source: 'admin_users' },
        permissions: ['admin.users.read']
      },
      {
        id: 'system-health',
        type: 'alert',
        title: 'Estado del Sistema',
        size: 'medium',
        config: { alertType: 'system_status' },
        permissions: ['system.health.read']
      },
      {
        id: 'revenue-total',
        type: 'kpi',
        title: 'Ingresos Totales',
        size: 'small',
        config: { metric: 'total_revenue', format: 'currency' },
        permissions: ['finance.revenue.read']
      },
      {
        id: 'leads-conversion',
        type: 'chart',
        title: 'Conversión de Leads',
        size: 'large',
        config: { chartType: 'line', metric: 'conversion_funnel' },
        permissions: ['marketing.leads.read']
      }
    ]
  },
  admin: {
    id: 'admin_default',
    name: 'Dashboard Admin',
    role: 'admin',
    columns: 3,
    widgets: [
      {
        id: 'active-leads',
        type: 'kpi',
        title: 'Leads Activos',
        size: 'small',
        config: { metric: 'active_leads' },
        permissions: ['marketing.leads.read']
      },
      {
        id: 'conversion-rate',
        type: 'kpi',
        title: 'Tasa Conversión',
        size: 'small',
        config: { metric: 'conversion_rate', format: 'percentage' },
        permissions: ['marketing.analytics.read']
      },
      {
        id: 'monthly-revenue',
        type: 'kpi',
        title: 'Ingresos Mes',
        size: 'small',
        config: { metric: 'monthly_revenue', format: 'currency' },
        permissions: ['finance.revenue.read']
      },
      {
        id: 'content-performance',
        type: 'chart',
        title: 'Rendimiento Contenido',
        size: 'medium',
        config: { chartType: 'bar', metric: 'content_metrics' },
        permissions: ['content.analytics.read']
      },
      {
        id: 'lead-pipeline',
        type: 'table',
        title: 'Pipeline de Leads',
        size: 'medium',
        config: { tableType: 'lead_pipeline', limit: 10 },
        permissions: ['marketing.leads.read']
      }
    ]
  },
  editor: {
    id: 'editor_default',
    name: 'Dashboard Editor',
    role: 'editor',
    columns: 2,
    widgets: [
      {
        id: 'content-views',
        type: 'kpi',
        title: 'Visualizaciones',
        size: 'small',
        config: { metric: 'total_views' },
        permissions: ['content.analytics.read']
      },
      {
        id: 'blog-engagement',
        type: 'kpi',
        title: 'Engagement Blog',
        size: 'small',
        config: { metric: 'blog_engagement', format: 'percentage' },
        permissions: ['content.analytics.read']
      },
      {
        id: 'recent-posts',
        type: 'table',
        title: 'Posts Recientes',
        size: 'large',
        config: { tableType: 'recent_posts', limit: 5 },
        permissions: ['content.posts.read']
      },
      {
        id: 'seo-metrics',
        type: 'chart',
        title: 'Métricas SEO',
        size: 'medium',
        config: { chartType: 'area', metric: 'seo_performance' },
        permissions: ['content.seo.read']
      }
    ]
  },
  viewer: {
    id: 'viewer_default',
    name: 'Dashboard Viewer',
    role: 'viewer',
    columns: 2,
    widgets: [
      {
        id: 'basic-stats',
        type: 'kpi',
        title: 'Estadísticas Básicas',
        size: 'medium',
        config: { metric: 'basic_stats' },
        permissions: ['dashboard.basic.read']
      },
      {
        id: 'public-metrics',
        type: 'chart',
        title: 'Métricas Públicas',
        size: 'large',
        config: { chartType: 'line', metric: 'public_metrics' },
        permissions: ['dashboard.basic.read']
      }
    ]
  }
};

export function useRoleBasedLayouts() {
  const { userRole, hasPermission } = useRoleBasedPermissions();
  const [customLayouts, setCustomLayouts] = useState<Record<string, DashboardLayout>>({});
  const [activeLayoutId, setActiveLayoutId] = useState<string>('');

  // Obtener permisos del rol
  const rolePermissions = useMemo(() => {
    if (!userRole || userRole === 'none') {
      return ROLE_PERMISSIONS.none;
    }
    return ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.none;
  }, [userRole]);

  // Obtener layout por defecto basado en rol
  const defaultLayout = useMemo(() => {
    return defaultLayouts[userRole] || defaultLayouts.viewer;
  }, [userRole]);

  // Filtrar widgets basado en permisos
  const filteredLayout = useMemo(() => {
    if (!defaultLayout) return null;

    const allowedWidgets = defaultLayout.widgets.filter(widget => 
      widget.permissions.every(permission => hasPermission(permission as keyof RolePermissions))
    );

    return {
      ...defaultLayout,
      widgets: allowedWidgets
    };
  }, [defaultLayout, hasPermission, rolePermissions]);

  // Cargar layouts personalizados (esto sería desde Supabase)
  useEffect(() => {
    const loadCustomLayouts = async () => {
      try {
        // Aquí cargarías los layouts personalizados del usuario desde Supabase
        // const { data } = await supabase
        //   .from('user_dashboard_layouts')
        //   .select('*')
        //   .eq('user_id', userId);
        
        // Por ahora usamos mock data
        setCustomLayouts({});
      } catch (error) {
        console.error('Error loading custom layouts:', error);
      }
    };

    if (userRole) {
      loadCustomLayouts();
      setActiveLayoutId(defaultLayout?.id || '');
    }
  }, [userRole, defaultLayout]);

  const saveLayout = async (layout: DashboardLayout) => {
    try {
      // Aquí guardarías el layout en Supabase
      // await supabase
      //   .from('user_dashboard_layouts')
      //   .upsert({
      //     id: layout.id,
      //     user_id: userId,
      //     layout_data: layout,
      //     updated_at: new Date().toISOString()
      //   });

      setCustomLayouts(prev => ({
        ...prev,
        [layout.id]: layout
      }));

      return { success: true };
    } catch (error) {
      console.error('Error saving layout:', error);
      return { success: false, error };
    }
  };

  const deleteLayout = async (layoutId: string) => {
    try {
      // Aquí eliminarías el layout de Supabase
      // await supabase
      //   .from('user_dashboard_layouts')
      //   .delete()
      //   .eq('id', layoutId);

      setCustomLayouts(prev => {
        const newLayouts = { ...prev };
        delete newLayouts[layoutId];
        return newLayouts;
      });

      // Si era el activo, cambiar al por defecto
      if (activeLayoutId === layoutId) {
        setActiveLayoutId(defaultLayout?.id || '');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting layout:', error);
      return { success: false, error };
    }
  };

  const getActiveLayout = () => {
    if (customLayouts[activeLayoutId]) {
      return customLayouts[activeLayoutId];
    }
    return filteredLayout;
  };

  const getAllLayouts = () => {
    const layouts = [filteredLayout];
    Object.values(customLayouts).forEach(layout => {
      if (layout && layout.role === userRole) {
        layouts.push(layout);
      }
    });
    return layouts.filter(Boolean) as DashboardLayout[];
  };

  return {
    activeLayout: getActiveLayout(),
    defaultLayout: filteredLayout,
    customLayouts,
    allLayouts: getAllLayouts(),
    activeLayoutId,
    userRole,
    setActiveLayoutId,
    saveLayout,
    deleteLayout,
    hasPermission
  };
}