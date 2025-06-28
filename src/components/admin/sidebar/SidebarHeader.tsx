
import React from 'react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white font-medium text-sm">C</span>
      </div>
      {!isCollapsed && (
        <div>
          <h2 className="font-medium text-gray-900 text-lg">Capittal</h2>
          <p className="text-xs text-gray-500 font-light">Panel Administrativo</p>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
