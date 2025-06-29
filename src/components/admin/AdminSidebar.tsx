
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
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
    
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    
    return location.pathname.startsWith(url) && 
           (location.pathname === url || location.pathname.startsWith(url + '/'));
  };

  const getNavClass = (url: string, exact = false) => {
    return isActive(url, exact)
      ? "bg-gray-900 text-white hover:bg-gray-800 flex items-center h-10 px-3 rounded-md font-normal w-full transition-colors duration-200"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center h-10 px-3 rounded-md font-normal w-full transition-colors duration-200";
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <SidebarHeaderComponent isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-0 p-0">
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupContent className="py-0">
            <SidebarMenu className="gap-1">
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    className={getNavClass(item.url, item.exact)}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm ml-2">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
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
