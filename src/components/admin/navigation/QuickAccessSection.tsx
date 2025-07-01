
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
import { quickAccessItems } from './navigationData';

export function QuickAccessSection() {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === `/admin/${path}`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        ⚡ Acceso Rápido
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {quickAccessItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                asChild
                isActive={isActive(item.id)}
                size="sm"
              >
                <NavLink to={`/admin/${item.id}`}>
                  <item.icon className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
