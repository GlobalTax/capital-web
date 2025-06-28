
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
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
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs">{group.title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={getNavClass(item.url)}
                >
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarNavigationGroup;
