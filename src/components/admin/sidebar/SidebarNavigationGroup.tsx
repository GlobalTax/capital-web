
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
    <SidebarGroup className="py-0 px-1">
      <SidebarGroupLabel className="text-xs px-2 py-1 h-auto">{group.title}</SidebarGroupLabel>
      <SidebarGroupContent className="py-0">
        <SidebarMenu className="gap-0">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-7 px-2">
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
