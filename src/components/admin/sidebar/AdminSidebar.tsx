import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { sidebarSections } from './SidebarConfig';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarSection } from './SidebarSection';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { getMenuVisibility, userRole, isLoading } = useRoleBasedPermissions();
  
  // Estado para controlar secciones expandidas
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
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
    const activeSection = getActiveSectionTitle();
    if (activeSection) {
      setExpandedSections(prev => ({
        ...prev,
        [activeSection]: true
      }));
    }
  }, [location.pathname]);
  
  // Función para toggle de secciones
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

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

  const menuVisibility = getMenuVisibility();

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