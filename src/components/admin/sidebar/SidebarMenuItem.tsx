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
      className="flex items-center justify-between w-full px-3 py-3 transition-colors duration-150"
    >
      <div className="flex items-center gap-3 min-w-0">
        <item.icon className={`h-4 w-4 shrink-0 ${
          isActive ? 'text-blue-600' : 'text-gray-600'
        }`} />
        {!isCollapsed && (
          <span className={`text-sm truncate ${
            isActive ? 'font-semibold text-blue-600' : 'font-normal text-gray-700'
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
          group relative rounded-md transition-colors duration-150
          ${isActive 
            ? 'bg-blue-50' 
            : 'hover:bg-gray-50'
          }
        `}
      >
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-normal bg-white border-gray-200">
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