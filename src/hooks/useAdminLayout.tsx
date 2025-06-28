
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
      { title: 'Dashboard', url: '/admin' }
    ];

    if (segments.length > 1) {
      const section = segments[1];
      const sectionTitles: Record<string, string> = {
        'case-studies': 'Casos de Éxito',
        'operations': 'Operaciones',
        'blog': 'Blog Posts',
        'multiples': 'Múltiplos',
        'statistics': 'Estadísticas',
        'team': 'Equipo',
        'testimonials': 'Testimonios',
        'carousel-testimonials': 'Testimonios Carrusel',
        'carousel-logos': 'Logos Carrusel'
      };

      if (sectionTitles[section]) {
        breadcrumbs.push({
          title: sectionTitles[section],
          url: `/admin/${section}`
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
