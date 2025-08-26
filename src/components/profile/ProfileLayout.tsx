import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Home
} from 'lucide-react';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const breadcrumbs = [
      { label: 'Inicio', href: '/', icon: Home }
    ];

    if (path.includes('/perfil')) {
      breadcrumbs.push({ label: 'Perfil', href: '/perfil', icon: User });
    }

    if (path.includes('/valoraciones') && !path.includes('/valoraciones/')) {
      breadcrumbs.push({ label: 'Valoraciones', href: '/perfil/valoraciones', icon: BarChart3 });
    }

    if (path.includes('/valoraciones/') && path.split('/').length > 3) {
      breadcrumbs.push({ label: 'Valoraciones', href: '/perfil/valoraciones', icon: BarChart3 });
      breadcrumbs.push({ label: 'Detalle', href: path, icon: null });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      {/* Header con breadcrumbs */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={`${breadcrumb.href}-${index}`} className="flex items-center">
                  <Link 
                    to={breadcrumb.href} 
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                    {breadcrumb.label}
                  </Link>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 ml-2" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-normal">
                {user?.email}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://app.capittal.es/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;