
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { NavigationGroup as NavigationGroupType } from './navigationData';

interface NavigationGroupProps {
  group: NavigationGroupType;
}

export function NavigationGroup({ group }: NavigationGroupProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === `/admin/${path}`;

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'URGENTE':
        return 'bg-red-500 text-white animate-pulse';
      case 'AI':
        return 'bg-blue-500 text-white';
      case 'NEW':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {group.title}
      </SidebarGroupLabel>
      {!isCollapsed && (
        <div className="text-xs text-gray-400 px-2 mb-2">
          {group.description}
        </div>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                asChild
                isActive={isActive(item.id)}
                className="group relative"
                tooltip={isCollapsed ? item.title : undefined}
              >
                <NavLink to={`/admin/${item.id}`}>
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-1.5 py-0.5 ${getBadgeStyles(item.badge)}`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
