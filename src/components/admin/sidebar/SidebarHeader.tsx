import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarHeader as UISidebarHeader } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Shield, Home } from 'lucide-react';

interface SidebarHeaderProps {
  userRole?: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ userRole }) => {
  return (
    <UISidebarHeader className="p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
          <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Capittal Admin</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-sidebar-foreground/60">Panel de Control</p>
            {userRole && (
              <Badge variant="outline" className="text-xs border-sidebar-border text-sidebar-foreground/80">
                {userRole}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </UISidebarHeader>
  );
};