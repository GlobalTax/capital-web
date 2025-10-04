import React from 'react';
import { SidebarHeader as UISidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

interface SidebarHeaderProps {
  userRole?: string;
  onSearch?: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ userRole }) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <UISidebarHeader className="p-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">Capittal Admin</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500">Panel de Control</p>
              {userRole && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-gray-200 text-gray-600">
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