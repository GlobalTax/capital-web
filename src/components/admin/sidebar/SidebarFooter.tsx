import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarFooter as UISidebarFooter } from '@/components/ui/sidebar';
import { Home } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <UISidebarFooter className="p-4 border-t border-sidebar-border">
      <Link 
        to="/" 
        className="flex items-center gap-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors px-2 py-2 rounded-md hover:bg-sidebar-accent/50"
      >
        <Home className="h-4 w-4" />
        Volver al sitio web
      </Link>
    </UISidebarFooter>
  );
};