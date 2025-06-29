
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard,
  FileText, 
  Building2, 
  Calculator, 
  PenTool, 
  MessageSquare, 
  TrendingUp,
  BarChart3,
  Users,
  Mail,
  UserPlus,
  Star,
  Image,
  BookOpen
} from 'lucide-react';

const dashboardItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
];

const navigationGroups = [
  {
    title: 'Contenido',
    items: [
      { title: 'Casos de Éxito', url: '/admin/case-studies', icon: FileText },
      { title: 'Operaciones', url: '/admin/operations', icon: Building2 },
      { title: 'AI Content Studio', url: '/admin/blog-v2', icon: PenTool, badge: 'NEW' },
      { title: 'Reports Sectoriales', url: '/admin/sector-reports', icon: BookOpen, badge: 'NEW' },
    ],
  },
  {
    title: 'Datos',
    items: [
      { title: 'Múltiplos', url: '/admin/multiples', icon: BarChart3 },
      { title: 'Estadísticas', url: '/admin/statistics', icon: TrendingUp },
    ],
  },
  {
    title: 'Leads',
    items: [
      { title: 'Valoraciones', url: '/admin/valuation-leads', icon: Calculator },
      { title: 'Contacto', url: '/admin/contact-leads', icon: Mail },
      { title: 'Colaboradores', url: '/admin/collaborator-applications', icon: UserPlus },
    ],
  },
  {
    title: 'Usuarios',
    items: [
      { title: 'Equipo', url: '/admin/team', icon: Users },
      { title: 'Testimonios', url: '/admin/testimonials', icon: MessageSquare },
      { title: 'Test. Carrusel', url: '/admin/carousel-testimonials', icon: Star },
      { title: 'Logos Carrusel', url: '/admin/carousel-logos', icon: Image },
    ],
  },
];

const MinimalSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  const isActive = (url: string, exact = false) => {
    if (exact) {
      return location.pathname === url;
    }
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(url);
  };

  const getNavClass = (url: string, exact = false) => {
    const baseClasses = "w-full justify-start font-normal text-sm transition-colors duration-200";
    return isActive(url, exact)
      ? `${baseClasses} bg-gray-100 text-gray-900 font-medium`
      : `${baseClasses} text-gray-600 hover:text-gray-900 hover:bg-gray-50`;
  };

  return (
    <Sidebar className="border-r border-gray-200/50">
      <SidebarHeader className="border-b border-gray-200/50 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium text-sm">C</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-medium text-gray-900">Capittal</h2>
              <p className="text-xs text-gray-500 -mt-0.5">Panel Administrativo</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Dashboard */}
        <SidebarGroup className="mb-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url, item.exact)}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-0 mb-2">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full ml-3">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md font-medium">
                                {item.badge}
                              </span>
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
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default MinimalSidebar;
