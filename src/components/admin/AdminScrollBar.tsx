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

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/contacts': 'Contactos',
  '/admin/leads': 'Leads',
  '/admin/blog': 'Blog',
  '/admin/settings': 'Configuración',
  '/admin/landing-pages': 'Landing Pages',
  '/admin/analytics': 'Analytics',
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
    <div className="sticky top-16 z-20 bg-muted/50 border-b backdrop-blur-sm">
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
              const label = routeLabels[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
              const isLast = index === pathSegments.length - 1;

              return (
                <React.Fragment key={path}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={path}>{label}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
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
