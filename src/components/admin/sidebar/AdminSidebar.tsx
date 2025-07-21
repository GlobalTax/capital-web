
import React, { useState, useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';

import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSection } from './SidebarSection';

import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';

import { sidebarSections } from './SidebarConfig';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { getMenuVisibility, userRole, isLoading, error } = useRoleBasedPermissions();
  const mountedRef = useRef(true);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const getActiveSectionTitle = (): string | null => {
    const currentPath = location.pathname;
    
    for (const section of sidebarSections) {
      const hasActiveItem = section.items.some(item => item.url === currentPath);
      if (hasActiveItem) {
        return section.title;
      }
    }
    return null;
  };
  
  useEffect(() => {
    if (!mountedRef.current) return;
    
    const activeSection = getActiveSectionTitle();
    if (activeSection && mountedRef.current) {
      setExpandedSections(prev => ({
        ...prev,
        [activeSection]: true
      }));
    }
  }, [location.pathname]);
  
  const toggleSection = (sectionTitle: string) => {
    if (!mountedRef.current) return;
    
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const menuVisibility = React.useMemo(() => {
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

  if (error) {
    return (
      <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
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
      <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
        <SidebarHeader userRole="Cargando..." />
        <SidebarContent>
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando permisos...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const getItemVisibility = (url: string): boolean => {
    const route = url.split('/').pop() || '';
    
    if (url === '/admin') return true;
    
    if (userRole === 'super_admin') return true;
    
    const routePermissionMap: Record<string, keyof typeof menuVisibility> = {
      'lead-scoring': 'leadScoring',
      'lead-scoring-rules': 'leadScoringRules',
      'contact-leads': 'contactLeads',
      'contacts': 'contacts',
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
      'content-performance': 'contentPerformance',
      'content-studio': 'contentStudio',
      'tracking-dashboard': 'trackingDashboard',
      'tracking-config': 'trackingConfig'
    };

    const permissionKey = routePermissionMap[route];
    return permissionKey ? menuVisibility[permissionKey] : false;
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
      <SidebarHeader userRole={userRole} />
      
      <SidebarContent>
        {sidebarSections.map((section) => {
          const visibleItems = section.items.filter(item => getItemVisibility(item.url));
          
          return (
            <SidebarSection 
              key={section.title} 
              section={section} 
              visibleItems={visibleItems} 
              isExpanded={expandedSections[section.title] || false}
              onToggle={() => toggleSection(section.title)}
            />
          );
        })}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
};
