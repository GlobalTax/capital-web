import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarFooter as UISidebarFooter } from '@/components/ui/sidebar';
import { Home } from 'lucide-react';

export const SidebarFooter: React.FC = () => {
  return (
    <UISidebarFooter className="p-4 border-t border-gray-100">
      <Link 
        to="/" 
        className="flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
      >
        <Home className="h-4 w-4" />
        Volver al sitio web
      </Link>
    </UISidebarFooter>
  );
};