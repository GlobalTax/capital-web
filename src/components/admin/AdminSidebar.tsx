
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import SidebarHeaderComponent from './sidebar/SidebarHeader';
import SidebarNavigationGroup from './sidebar/SidebarNavigationGroup';
import { dashboardItems, navigationGroups } from './sidebar/navigationData';

const AdminSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string, exact = false) => {
    if (exact) {
      return location.pathname === url;
    }
    return location.pathname.startsWith(url);
  };

  const getNavClass = (url: string, exact = false) => {
    return isActive(url, exact)
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "hover:bg-accent hover:text-accent-foreground";
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-3">
        <SidebarHeaderComponent isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-0 p-1">
        <SidebarGroup className="p-1">
          <SidebarMenu className="gap-0">
            {dashboardItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-7 px-2">
                  <NavLink
                    to={item.url}
                    className={getNavClass(item.url, item.exact)}
                  >
                    {!isCollapsed && <span className="text-sm">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {navigationGroups.map((group) => (
          <SidebarNavigationGroup
            key={group.title}
            group={group}
            isCollapsed={isCollapsed}
            getNavClass={getNavClass}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
