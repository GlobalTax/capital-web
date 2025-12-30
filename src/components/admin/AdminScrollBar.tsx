import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import { isUuid, useBreadcrumbLabel } from '@/hooks/useBreadcrumbLabel';

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/contacts': 'Contactos',
  '/admin/leads': 'Leads',
  '/admin/blog': 'Blog',
  '/admin/settings': 'Configuración',
  '/admin/landing-pages': 'Landing Pages',
  '/admin/analytics': 'Analytics',
  '/admin/valoraciones-pro': 'Valoraciones Pro',
  '/admin/sectores': 'Sectores',
  '/admin/sector-dossiers': 'Sector Dossiers',
  '/admin/operaciones': 'Operaciones',
  '/admin/multiplos': 'Múltiplos',
  '/admin/multiplos-asesores': 'Múltiplos Asesores',
  '/admin/documentos-rod': 'Documentos ROD',
  '/admin/equipo': 'Equipo',
  '/admin/testimonios': 'Testimonios',
  '/admin/lp-venta-empresas': 'LP Venta Empresas',
  '/admin/logos-carousel': 'Logos Carousel',
  '/admin/banners': 'Banners',
};

const formatSegment = (segment: string): string => {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Componente para un item de breadcrumb con resolución dinámica
const DynamicBreadcrumbItem: React.FC<{
  segment: string;
  parentSegment?: string;
  path: string;
  isLast: boolean;
}> = ({ segment, parentSegment, path, isLast }) => {
  const { label: dynamicLabel } = useBreadcrumbLabel(segment, parentSegment);
  
  // Prioridad: routeLabels > dynamicLabel (para UUIDs) > formatSegment
  const label = routeLabels[path] || dynamicLabel || formatSegment(segment);

  return (
    <BreadcrumbItem>
      {isLast ? (
        <BreadcrumbPage>{label}</BreadcrumbPage>
      ) : (
        <BreadcrumbLink href={path}>{label}</BreadcrumbLink>
      )}
    </BreadcrumbItem>
  );
};

export const AdminScrollBar: React.FC = () => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.querySelector('main');
      if (!scrollContainer) return;

      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      
      setScrollProgress(progress);
    };

    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="sticky top-16 z-40 bg-muted/50 border-b backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 h-12">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {isHome ? (
                <BreadcrumbPage className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href="/admin" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!isHome && <BreadcrumbSeparator />}
            
            {!isHome && pathSegments.map((segment, index) => {
              if (segment === 'admin') return null;
              
              const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
              const isLast = index === pathSegments.length - 1;
              const parentSegment = index > 1 ? pathSegments[index - 1] : undefined;

              return (
                <span className="contents" key={path}>
                  <DynamicBreadcrumbItem
                    segment={segment}
                    parentSegment={parentSegment}
                    path={path}
                    isLast={isLast}
                  />
                  {!isLast && <BreadcrumbSeparator />}
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Scroll Progress Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{Math.round(scrollProgress)}%</span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
