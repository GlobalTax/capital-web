
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  Building2,
  PenTool,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Image,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
];

const contentItems = [
  {
    title: 'Casos de Éxito',
    url: '/admin/case-studies',
    icon: FileText,
  },
  {
    title: 'Operaciones',
    url: '/admin/operations',
    icon: Building2,
  },
  {
    title: 'Blog Posts',
    url: '/admin/blog',
    icon: PenTool,
  },
];

const dataItems = [
  {
    title: 'Múltiplos',
    url: '/admin/multiples',
    icon: BarChart3,
  },
  {
    title: 'Estadísticas',
    url: '/admin/statistics',
    icon: TrendingUp,
  },
];

const userItems = [
  {
    title: 'Equipo',
    url: '/admin/team',
    icon: Users,
  },
  {
    title: 'Testimonios',
    url: '/admin/testimonials',
    icon: MessageSquare,
  },
  {
    title: 'Test. Carrusel',
    url: '/admin/carousel-testimonials',
    icon: Star,
  },
];

const visualItems = [
  {
    title: 'Logos Carrusel',
    url: '/admin/carousel-logos',
    icon: Image,
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();

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
      <SidebarHeader className="border-b border-border p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg">Capittal</h2>
              <p className="text-xs text-muted-foreground">Panel Admin</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    className={getNavClass(item.url, item.exact)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Datos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Usuarios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Visuales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visualItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClass(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
