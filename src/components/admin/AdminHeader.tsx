
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDropdown from './header/UserDropdown';
import NotificationCenter from './header/NotificationCenter';

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-light text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-500 font-light">
            Gestiona tu contenido y configuraciones
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
          <Settings className="h-4 w-4" />
        </Button>
        <UserDropdown onLogout={onLogout} />
      </div>
    </header>
  );
};

export default AdminHeader;
