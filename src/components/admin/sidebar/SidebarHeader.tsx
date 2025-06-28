
import React from 'react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-xs">C</span>
      </div>
      {!isCollapsed && (
        <div>
          <h2 className="font-bold text-sm">Capittal</h2>
          <p className="text-xs text-muted-foreground">Panel Admin</p>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
