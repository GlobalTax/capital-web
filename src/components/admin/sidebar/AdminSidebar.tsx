import React, { useEffect, useRef, useMemo } from 'react';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { sidebarSections } from '@/features/admin/config/sidebar-config';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSection } from './SidebarSection';

export const AdminSidebar: React.FC = () => {
  const { getMenuVisibility, userRole, isLoading, error } = useRoleBasedPermissions();
  const mountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const menuVisibility = useMemo(() => {
    try {
      return getMenuVisibility();
    } catch (error) {
      console.error('Error getting menu visibility:', error);
      return {
        dashboard: true,
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
        operations: false,
        multiples: false,
        sectors: false,
        statistics: false,
        team: false,
        testimonials: false,
        carouselTestimonials: false,
        carouselLogos: false,
        banners: false,
        marketingAutomation: false,
        marketingIntelligence: false,
        marketingHub: false,
        integrations: false,
        adminUsers: false,
        settings: false,
        contentPerformance: false,
        contentStudio: false,
        landingPages: false,
        trackingDashboard: false,
        trackingConfig: false,
      };
    }
  }, [getMenuVisibility]);

  // Debug visibility
  console.debug('[AdminSidebar] role:', userRole, 'banners visible:', (menuVisibility as any)?.banners);

  if (error) {
    return (
      <Sidebar className="border-r border-gray-100 bg-white" collapsible="icon">
        <SidebarHeader userRole="Error" />
        <SidebarContent>
          <div className="p-4 text-center">
            <p className="text-sm text-red-500 mb-2">Error de permisos</p>
            <p className="text-xs text-gray-500">Modo básico activo</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (isLoading) {
    return (
      <Sidebar className="border-r border-gray-100 bg-white" collapsible="icon">
        <SidebarHeader userRole="Cargando..." />
        <SidebarContent>
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando permisos...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Mapear visibilidad de permisos a los items del sidebar
  const getItemVisibility = (url: string): boolean => {
    // Normalizar ruta: quitar trailing slash y obtener el primer segmento tras /admin
    const clean = url.replace(/\/+$/, '');
    if (clean === '/admin') return true; // Dashboard siempre visible

    // Super admin siempre tiene acceso a todo
    if (userRole === 'super_admin') return true;

    const route = clean.replace(/^\/admin\/?/, '').split('/')[0] || '';

    // Mapear rutas a permisos - SINCRONIZADO con AdminRouter y useRoleBasedPermissions
    const routePermissionMap: Record<string, keyof typeof menuVisibility> = {
      'lead-scoring': 'leadScoring',
      'lead-scoring-rules': 'leadScoringRules',
      'contact-leads': 'contactLeads',
      'contacts': 'contacts',
      'form-submissions': 'contacts', // Use contacts permission for form submissions
      'contact-lists': 'contactLists',
      'collaborator-applications': 'collaboratorApplications',
      'alerts': 'alerts',
      'proposals': 'proposals',
      'email-marketing': 'emailMarketing',
      'marketing-automation': 'marketingAutomation',
      'blog-v2': 'blogV2',
      'sector-reports': 'sectorReports',
      'case-studies': 'caseStudies',
      'lead-magnets': 'leadMagnets',
      'landing-pages': 'landingPages',
      'operations': 'operations',
      'multiples': 'multiples',
      'sectors': 'sectors',
      'statistics': 'statistics',
      'team': 'team',
      'testimonials': 'testimonials',
      'carousel-testimonials': 'carouselTestimonials',
      'carousel-logos': 'carouselLogos',
      'banners': 'banners',
      'marketing-intelligence': 'marketingIntelligence',
      'marketing-hub': 'marketingHub',
      'integrations': 'integrations',
      'admin-users': 'adminUsers',
      'settings': 'settings',
      // Nuevas rutas de tracking
      'content-performance': 'contentPerformance',
      'content-studio': 'contentStudio',
      'tracking-dashboard': 'trackingDashboard',
      'tracking-config': 'trackingConfig'
    };

    const permissionKey = routePermissionMap[route];
    const result = permissionKey ? (menuVisibility as any)[permissionKey] : false;

    if (route === 'banners') {
      console.debug('[AdminSidebar] item=banners -> permissionKey:', permissionKey, 'value:', result);
    }

    return result;
  };

  return (
    <Sidebar className="border-r border-gray-100 bg-white" collapsible="icon">
      <SidebarHeader userRole={userRole} />
      
      <SidebarContent className="py-2">
        {sidebarSections.map((section) => {
          const visibleItems = section.items.filter(item => 
            getItemVisibility(item.url) && (item.visible !== false)
          );
          
          if (visibleItems.length === 0) return null;
          
          return (
            <SidebarSection 
              key={section.title} 
              section={section} 
              visibleItems={visibleItems}
            />
          );
        })}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
};