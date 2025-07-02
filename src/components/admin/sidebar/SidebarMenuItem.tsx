import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarMenuItem as UISidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { SidebarItem } from './SidebarConfig';
import { SidebarBadge } from './SidebarBadge';

interface SidebarMenuItemProps {
  item: SidebarItem;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.url;

  return (
    <UISidebarMenuItem>
      <SidebarMenuButton 
        asChild
        isActive={isActive}
        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors rounded-md"
      >
        <Link to={item.url} className="flex items-center justify-between w-full px-2 py-2">
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
            <span className="text-sm font-medium text-sidebar-foreground">{item.title}</span>
          </div>
          {item.badge && <SidebarBadge badge={item.badge} />}
        </Link>
      </SidebarMenuButton>
    </UISidebarMenuItem>
  );
};