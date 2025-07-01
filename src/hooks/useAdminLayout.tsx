
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  url?: string;
}

export const useAdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Inicio', url: '/admin' }
    ];

    if (segments.length > 1) {
      const section = segments[1];
      const sectionTitles: Record<string, string> = {
        'dashboard': 'Dashboard',
        'cms-dashboard': 'Dashboard CMS',
        'leads-dashboard': 'Dashboard Leads & Workflows',
        'analytics-dashboard': 'Dashboard Analytics & Intelligence',
        'marketing-intelligence': 'Marketing Intelligence',
        'lead-scoring': 'Lead Scoring',
        'marketing-automation': 'Marketing Automation',
        'marketing-hub': 'Marketing Hub',
        'crm': 'CRM',
        'alerts': 'Alertas',
        'integrations': 'Integraciones Estratégicas',
        'case-studies': 'Casos de Éxito',
        'operations': 'Operaciones',
        'blog': 'Blog Posts',
        'blog-v2': 'AI Content Studio Pro',
        'sector-reports': 'Reports Sectoriales IA',
        'multiples': 'Múltiplos',
        'statistics': 'Estadísticas',
        'contact-leads': 'Leads de Contacto',
        'collaborator-applications': 'Solicitudes Colaboradores',
        'team': 'Equipo',
        'testimonials': 'Testimonios',
        'carousel-testimonials': 'Testimonios Carrusel',
        'carousel-logos': 'Logos Carrusel',
        'lead-magnets': 'Lead Magnets',
        'settings': 'Configuración'
      };

      if (sectionTitles[section]) {
        breadcrumbs.push({
          title: sectionTitles[section]
        });
      }
    }

    return breadcrumbs;
  };

  return {
    sidebarCollapsed,
    setSidebarCollapsed,
    breadcrumbs: getBreadcrumbs(),
    current: location.pathname
  };
};
