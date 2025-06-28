
import React from 'react';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">C</span>
      </div>
      {!isCollapsed && (
        <div>
          <h2 className="font-bold text-lg">Capittal</h2>
          <p className="text-xs text-muted-foreground">Panel Admin</p>
        </div>
      )}
    </div>
  );
};

export default SidebarHeader;
