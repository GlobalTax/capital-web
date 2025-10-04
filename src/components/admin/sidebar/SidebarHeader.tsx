import React, { useState } from 'react';
import { SidebarHeader as UISidebarHeader, SidebarInput, useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Shield, Search } from 'lucide-react';

interface SidebarHeaderProps {
  userRole?: string;
  onSearch?: (query: string) => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ userRole, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <UISidebarHeader className="p-4 border-b border-sidebar-border space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-sidebar-foreground">Capittal Admin</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-sidebar-foreground/60">Panel de Control</p>
              {userRole && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-sidebar-border text-sidebar-foreground/80">
                  {userRole}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/50" />
          <SidebarInput
            type="text"
            placeholder="Buscar... (Cmd+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs bg-sidebar-accent/30 border-sidebar-border focus-visible:ring-primary"
          />
        </div>
      )}
    </UISidebarHeader>
  );
};