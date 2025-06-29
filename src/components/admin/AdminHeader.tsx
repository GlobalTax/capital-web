
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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-4 lg:px-6 w-full shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-md p-2 transition-all duration-200"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="border-l border-gray-200 pl-3 lg:pl-4">
          <h1 className="text-lg lg:text-xl font-light text-gray-900">Panel de Administración</h1>
        </div>
      </div>

      <div className="flex items-center gap-1 lg:gap-2">
        <NotificationCenter />
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-md p-2 transition-all duration-200"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="border-l border-gray-200 pl-1 lg:pl-2 ml-1 lg:ml-2">
          <UserDropdown onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
