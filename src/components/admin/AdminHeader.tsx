
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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="border-l border-gray-200 pl-4">
          <h1 className="text-lg font-medium text-gray-900 truncate">Panel de Administración</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationCenter />
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="border-l border-gray-200 pl-3">
          <UserDropdown onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
