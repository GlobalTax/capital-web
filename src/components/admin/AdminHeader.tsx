
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
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-2"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="border-l border-slate-200 pl-4">
          <h1 className="page-title">Panel de Administración</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationCenter />
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="border-l border-slate-200 pl-3">
          <UserDropdown onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
