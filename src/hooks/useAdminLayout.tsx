
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
        // LEADS & WORKFLOWS
        'crm': 'CRM',
        'marketing-automation': 'Marketing Automation',
        'alerts': 'Alertas',
        'contact-leads': 'Leads de Contacto',
        'collaborator-applications': 'Solicitudes Colaboradores',
        
        // CMS - CONTENIDO WEB
        'blog-v2': 'AI Content Studio Pro',
        'sector-reports': 'Reports Sectoriales IA',
        'case-studies': 'Casos de Éxito',
        'operations': 'Operaciones',
        'multiples': 'Múltiplos',
        'statistics': 'Estadísticas',
        'team': 'Equipo',
        'testimonials': 'Testimonios',
        'carousel-testimonials': 'Testimonios Carrusel',
        'carousel-logos': 'Logos Carrusel',
        'lead-magnets': 'Lead Magnets',
        
        // MARKETING INTELLIGENCE & ANALYTICS
        'marketing-intelligence': 'Marketing Intelligence',
        'marketing-hub': 'Marketing Hub',
        'integrations': 'Integraciones Estratégicas',
        
        // CONFIGURACIÓN & SISTEMA
        'dashboard': 'Dashboard',
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
