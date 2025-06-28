
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
    <SidebarGroup className="px-2 py-1">
      <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
        {group.title}
      </SidebarGroupLabel>
      <SidebarGroupContent className="py-0">
        <SidebarMenu className="gap-1">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="h-9 px-3 rounded-lg font-medium transition-all duration-200">
                <NavLink
                  to={item.url}
                  className={getNavClass(item.url)}
                >
                  {!isCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border-blue-200">
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
