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
import { cn } from '@/lib/utils';

interface SidebarMenuItemProps {
  item: SidebarItem;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ item }) => {
  const location = useLocation();
  const { state } = useSidebar();
  const isActive = item.url === '/admin' 
    ? location.pathname === '/admin' || location.pathname === '/admin/'
    : location.pathname === item.url || location.pathname.startsWith(item.url + '/');
  const isCollapsed = state === 'collapsed';

  const content = (
    <Link 
      to={item.url} 
      className="flex items-center justify-between w-full px-2 py-1.5 transition-colors duration-100"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <item.icon className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive 
            ? 'text-[hsl(var(--accent-primary))]' 
            : 'text-[hsl(var(--linear-text-tertiary))]'
        )} />
        {!isCollapsed && (
          <span className={cn(
            "text-[13px] truncate transition-colors",
            isActive 
              ? 'font-medium text-[hsl(var(--accent-primary))]' 
              : 'font-normal text-[hsl(var(--linear-text-secondary))]'
          )}>
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
        className={cn(
          "group relative rounded-md transition-all duration-100",
          isActive 
            ? 'bg-[hsl(var(--accent-soft))] border-l-2 border-l-[hsl(var(--accent-primary))]' 
            : 'hover:bg-[hsl(var(--linear-bg-hover))] border-l-2 border-l-transparent'
        )}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-normal bg-card border-[hsl(var(--linear-border))]">
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
