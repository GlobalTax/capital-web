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
        'marketing-intelligence': 'Marketing Intelligence',
        'case-studies': 'Casos de Éxito',
        'operations': 'Operaciones',
        'blog': 'Blog Posts',
        'blog-v2': 'AI Content Studio Pro',
        'sector-reports': 'Reports Sectoriales IA',
        'multiples': 'Múltiplos',
        'statistics': 'Estadísticas',
        'team': 'Equipo',
        'testimonials': 'Testimonios',
        'carousel-testimonials': 'Testimonios Carrusel',
        'carousel-logos': 'Logos Carrusel',
        'contact-leads': 'Leads de Contacto',
        'collaborator-applications': 'Solicitudes Colaboradores',
        'lead-magnets': 'Lead Magnets'
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
    currentPath: location.pathname
  };
};
