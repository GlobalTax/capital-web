
import React from 'react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      {!isCollapsed && (
        <div>
          <h2 className="font-bold text-slate-900 text-lg">Capittal</h2>
          <p className="text-xs text-slate-500 font-medium">Panel Administrativo</p>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
