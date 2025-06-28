
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { NavigationGroup } from './types';

interface SidebarNavigationGroupProps {
  group: NavigationGroup;
  isCollapsed: boolean;
  getNavClass: (url: string, exact?: boolean) => string;
}

const SidebarNavigationGroup = ({ group, isCollapsed, getNavClass }: SidebarNavigationGroupProps) => {
  return (
    <SidebarGroup className="px-4 py-2">
      {!isCollapsed && (
        <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 mb-2">
          {group.title}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent className="py-0">
        <SidebarMenu className="gap-1">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <NavLink
                to={item.url}
                className={getNavClass(item.url)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full ml-2">
                    <span className="text-sm">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 border-gray-200">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigationGroup;
