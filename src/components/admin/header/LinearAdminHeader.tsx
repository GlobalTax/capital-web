import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, RotateCcw, ChevronRight, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import LinearNotificationCenter from './LinearNotificationCenter';
import LinearUserDropdown from './LinearUserDropdown';
import { clearAllCaches } from '@/utils/resetWebSocketState';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LinearAdminHeaderProps {
  onLogout: () => void;
}

// Extended route labels for breadcrumb
const routeLabels: Record<string, string> = {
  'admin': 'Dashboard',
  'contacts': 'Contactos',
  'leads': 'Leads',
  'blog': 'Blog',
  'settings': 'Configuración',
  'landing-pages': 'Landing Pages',
  'analytics': 'Analytics',
  'valuation-analytics': 'Analíticas de Valoración',
  'operations': 'Operaciones',
  'bookings': 'Reservas',
  'users': 'Usuarios',
  'banners': 'Banners',
  'videos': 'Videos',
  'testimonials': 'Testimonios',
  'case-studies': 'Casos de Éxito',
  'sectors': 'Sectores',
  'multiples': 'Múltiplos',
  'workflow': 'Workflow',
  'notifications': 'Notificaciones',
  'pipeline': 'Pipeline',
  'collaborators': 'Colaboradores',
  'acquisition': 'Adquisiciones',
  'design-system': 'Design System',
};

const LinearAdminHeader = ({ onLogout }: LinearAdminHeaderProps) => {
  const location = useLocation();
  const { toast } = useToast();
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleClearCache = async () => {
    toast({
      title: "Limpiando caché...",
      description: "La página se recargará automáticamente.",
    });
    
    try {
      await clearAllCaches();
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Error",
        description: "Error al limpiar el caché.",
        variant: "destructive"
      });
    }
  };

  // Generate breadcrumb items from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  const breadcrumbItems = pathSegments
    .filter(segment => segment !== 'admin')
    .map((segment, index) => {
      const path = '/' + pathSegments.slice(0, pathSegments.indexOf(segment) + 1).join('/');
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      const isLast = index === pathSegments.filter(s => s !== 'admin').length - 1;
      
      return { path, label, isLast };
    });

  return (
    <header className="h-12 bg-[hsl(var(--linear-bg))] border-b border-[hsl(var(--linear-border))] flex items-center justify-between px-3 sticky top-0 z-50">
      {/* Left section - Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <SidebarTrigger className="h-8 w-8 shrink-0" />
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          <Link 
            to="/admin" 
            className={cn(
              "flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0",
              isHome && "text-foreground font-medium"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            {isHome && <span>Dashboard</span>}
          </Link>
          
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              {item.isLast ? (
                <span className="text-foreground font-medium truncate">
                  {item.label}
                </span>
              ) : (
                <Link 
                  to={item.path}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Expandable Search */}
        <div className="relative flex items-center">
          {searchExpanded ? (
            <div className="flex items-center gap-1 animate-in slide-in-from-right-2 duration-200">
              <Input
                type="text"
                placeholder="Buscar... (Esc para cerrar)"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchExpanded(false);
                    setSearchValue('');
                  }
                }}
                className="h-7 w-48 text-sm bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setSearchExpanded(false);
                  setSearchValue('');
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchExpanded(true)}
              title="Buscar (Cmd+K para paleta)"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Notifications with dot indicator */}
        <LinearNotificationCenter />
        
        {/* Clear cache */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleClearCache}
          title="Limpiar caché"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Separator */}
        <div className="w-px h-5 bg-[hsl(var(--linear-border))] mx-1" />
        
        {/* User dropdown */}
        <LinearUserDropdown onLogout={onLogout} />
      </div>
    </header>
  );
};

export default LinearAdminHeader;
