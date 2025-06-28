
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
      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border-l-2 border-blue-500"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200";
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white shadow-sm">
      <SidebarHeader className="border-b border-slate-100 p-4 bg-slate-50/50">
        <SidebarHeaderComponent isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent className="gap-1 p-2">
        <SidebarGroup className="px-2 py-1">
          <SidebarMenu className="gap-1">
            {dashboardItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild className="h-9 px-3 rounded-lg font-medium transition-all duration-200">
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
