import { Link, useLocation } from 'react-router-dom';
import { BookOpen, BookMarked, Wrench, Trophy, Library, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/search-funds/recursos', label: 'Inicio', icon: BookOpen, exact: true },
  { href: '/search-funds/recursos/guia', label: 'Guía Completa', icon: BookOpen },
  { href: '/search-funds/recursos/glosario', label: 'Glosario M&A', icon: BookMarked },
  { href: '/search-funds/recursos/herramientas', label: 'Herramientas', icon: Wrench },
  { href: '/search-funds/recursos/casos', label: 'Casos de Éxito', icon: Trophy },
  { href: '/search-funds/recursos/biblioteca', label: 'Biblioteca', icon: Library },
  { href: '/search-funds/recursos/comunidad', label: 'Comunidad', icon: Users },
];

export const ResourceCenterNav = () => {
  const location = useLocation();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href) && href !== '/search-funds/recursos';
  };

  return (
    <nav className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
