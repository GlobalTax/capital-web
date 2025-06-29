
import React from 'react';
import { Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDropdown from './header/UserDropdown';
import NotificationCenter from './header/NotificationCenter';

interface AdminHeaderProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const AdminHeader = ({ onLogout, onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 w-full">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-light text-gray-900">Panel de Administración</h1>
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
