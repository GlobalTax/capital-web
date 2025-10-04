import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SidebarMenuItem as UISidebarMenuItem, 
  SidebarMenuButton,
  useSidebar 
} from '@/components/ui/sidebar';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarItem } from '@/features/admin/config/sidebar-config';
import { SidebarBadge } from './SidebarBadge';

interface SidebarMenuItemProps {
  item: SidebarItem;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item }) => {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = location.pathname === item.url;
  const isCollapsed = state === 'collapsed';

  const content = (
    <Link 
      to={item.url} 
      className="flex items-center justify-between w-full px-3 py-2.5 group-hover:scale-[1.02] transition-all duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <item.icon className={`h-4 w-4 shrink-0 transition-colors ${
          isActive ? 'text-primary' : 'text-sidebar-foreground/60'
        }`} />
        {!isCollapsed && (
          <span className={`text-sm truncate transition-colors ${
            isActive ? 'font-semibold text-sidebar-foreground' : 'font-medium text-sidebar-foreground/80'
          }`}>
            {item.title}
          </span>
        )}
      </div>
      {item.badge && !isCollapsed && <SidebarBadge badge={item.badge} />}
    </Link>
  );

  return (
    <UISidebarMenuItem>
      <SidebarMenuButton 
        asChild
        isActive={isActive}
        tooltip={isCollapsed ? item.title : undefined}
        className={`
          group relative rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-sidebar-accent/80 border-l-4 border-primary shadow-sm' 
            : 'hover:bg-sidebar-accent/50 border-l-4 border-transparent'
          }
        `}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.title}
              {item.badge && (
                <span className="ml-2">
                  <SidebarBadge badge={item.badge} />
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        ) : (
          content
        )}
      </SidebarMenuButton>
    </UISidebarMenuItem>
  );
};