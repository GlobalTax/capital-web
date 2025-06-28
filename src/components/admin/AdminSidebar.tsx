
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
    
    // Para rutas no exactas, verificar que sea una sub-ruta válida
    // Evitar que /admin coincida con /admin/algo
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    
    // Para otras rutas, verificar que después del prefijo haya un / o sea el final
    return location.pathname.startsWith(url) && 
           (location.pathname === url || location.pathname.startsWith(url + '/'));
  };

  const getNavClass = (url: string, exact = false) => {
    return isActive(url, exact)
      ? "bg-gray-900/10 text-gray-900 font-medium border-r-2 border-blue-600 shadow-sm"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200";
  };

  return (
    <Sidebar className="border-r border-gray-200/60 bg-white/95 backdrop-blur-sm shadow-sm">
      <SidebarHeader className="border-b border-gray-100/80 p-6 bg-gradient-to-r from-gray-50/50 to-white">
        <SidebarHeaderComponent isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-2 p-3">
        <SidebarGroup className="px-2 py-2">
          <SidebarMenu className="gap-1">
            {dashboardItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-11 px-4 rounded-xl font-medium transition-all duration-300 hover:shadow-sm">
                  <NavLink
                    to={item.url}
                    className={getNavClass(item.url, item.exact)}
                  >
                    {!isCollapsed && <span className="text-sm tracking-wide">{item.title}</span>}
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
