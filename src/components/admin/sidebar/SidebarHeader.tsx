import React from 'react';
import { SidebarHeader as UISidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface SidebarHeaderProps {
  userRole?: string;
  onSearch?: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ userRole }) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <UISidebarHeader className="px-3 py-4 border-b border-[hsl(var(--sidebar-border))]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[hsl(var(--accent-primary))] rounded-md flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[hsl(var(--linear-text-primary))]">Capittal</h2>
              {userRole && userRole !== 'Cargando...' && userRole !== 'Error' && (
                <Badge variant="ghost" size="sm" className="text-[9px]">
                  {userRole}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </UISidebarHeader>
  );
};
