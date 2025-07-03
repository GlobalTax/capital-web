import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { sidebarSections } from './SidebarConfig';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSection } from './SidebarSection';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { getMenuVisibility, userRole, isLoading, error } = useRoleBasedPermissions();
  const mountedRef = useRef(true);
  
  // Estado para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Cleanup on unmount to prevent React #300 error
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  // Función para encontrar qué sección contiene la ruta activa
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
  
  // Expandir automáticamente la sección que contiene la ruta activa
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
  
  // Función para toggle de secciones
  const toggleSection = (sectionTitle: string) => {
    if (!mountedRef.current) return;
    
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // TODOS LOS HOOKS DEBEN EJECUTARSE SIEMPRE - NUNCA EARLY RETURNS
  const menuVisibility = React.useMemo(() => {
    try {
      return getMenuVisibility();
    } catch (error) {
      console.error('Error getting menu visibility:', error);
      // Fallback básico - solo dashboard visible
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
      };
    }
  }, [getMenuVisibility]);


  // RENDERIZADO CONDICIONAL - NUNCA EARLY RETURNS
  // Modo degradado en caso de error crítico
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

  // Mapear visibilidad de permisos a los items del sidebar
  const getItemVisibility = (url: string): boolean => {
    const route = url.split('/').pop() || '';
    
    // Dashboard siempre visible
    if (url === '/admin') return true;
    
    // Mapear rutas a permisos - SINCRONIZADO con AdminRouter y useRoleBasedPermissions
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
      'lead-magnets': 'leadMagnets',
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
      'settings': 'settings'
    };

    const permissionKey = routePermissionMap[route];
    return permissionKey ? menuVisibility[permissionKey] : false; // Cambio a false para ser más restrictivo
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
      <SidebarHeader userRole={userRole} />
      
      <SidebarContent>
        {sidebarSections.map((section) => {
          // Filtrar items visibles según permisos
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