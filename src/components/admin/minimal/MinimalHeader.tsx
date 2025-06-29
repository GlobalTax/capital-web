
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface MinimalHeaderProps {
  onLogout: () => void;
}

const MinimalHeader = ({ onLogout }: MinimalHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-medium text-sm">C</span>
            </div>
            <div>
              <h1 className="font-medium text-gray-900">Capittal</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Panel Administrativo</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 ml-8">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/classic"
              className={({ isActive }) =>
                `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              Vista Clásica
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;
