import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { sidebarSections } from '@/features/admin/config/sidebar-config';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSection } from './SidebarSection';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { getMenuVisibility, userRole, isLoading, error } = useRoleBasedPermissions();
  const mountedRef = useRef(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        marketingAutomation: false,
        marketingIntelligence: false,
        marketingHub: false,
        integrations: false,
        adminUsers: false,
        settings: false,
        contentPerformance: false,
        contentStudio: false,
        designResources: false,
        landingPages: false,
        trackingDashboard: false,
        trackingConfig: false,
      };
    }
  }, [getMenuVisibility]);

  // Filtrar items por búsqueda
  const filterItemsBySearch = useCallback((items: typeof sidebarSections[0]['items']) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);


  if (error) {
    return (
      <Sidebar className="border-r border-sidebar-border" collapsible="icon">
        <SidebarHeader userRole="Error" onSearch={setSearchQuery} />
        <SidebarContent>
          <div className="p-4 text-center">
            <p className="text-sm text-red-500 mb-2">Error de permisos</p>
            <p className="text-xs text-sidebar-foreground/60">Modo básico activo</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (isLoading) {
    return (
      <Sidebar className="border-r border-sidebar-border" collapsible="icon">
        <SidebarHeader userRole="Cargando..." onSearch={setSearchQuery} />
        <SidebarContent>
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-sidebar-foreground/60">Cargando permisos...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Mapear visibilidad de permisos a los items del sidebar
  const getItemVisibility = (url: string): boolean => {
    const route = url.split('/').pop() || '';
    
    // Dashboard siempre visible
    if (url === '/admin') return true;
    
    // Super admin siempre tiene acceso a todo
    if (userRole === 'super_admin') return true;
    
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
      'design-resources': 'designResources',
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
    return permissionKey ? menuVisibility[permissionKey] : false;
  };

  return (
    <Sidebar className="border-r border-sidebar-border" collapsible="icon">
      <SidebarHeader userRole={userRole} onSearch={setSearchQuery} />
      
      <SidebarContent className="py-2">
        {sidebarSections.map((section) => {
          const visibleItems = section.items.filter(item => 
            getItemVisibility(item.url) && (item.visible !== false)
          );
          
          const filteredItems = filterItemsBySearch(visibleItems);
          
          if (filteredItems.length === 0) return null;
          
          return (
            <SidebarSection 
              key={section.title} 
              section={section} 
              visibleItems={filteredItems}
            />
          );
        })}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
};