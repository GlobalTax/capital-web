
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  Mail,
  UserPlus,
  BookOpen,
  Calculator,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  variant?: "sidebar" | "floating" | "inset";
  onLogout: () => void;
}

export function AppSidebar({ variant = "sidebar", onLogout }: AppSidebarProps) {
  const location = useLocation();

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
    return isActive(url, exact)
      ? "bg-gray-900 text-white shadow-sm"
      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100";
  };

  const navigationGroups = [
    {
      title: 'Reports IA',
      items: [
        { title: 'AI Content Studio Pro', url: '/admin/blog-v2', icon: PenTool, badge: 'NEW' },
        { title: 'Reports Sectoriales IA', url: '/admin/sector-reports', icon: BookOpen, badge: 'NEW' },
      ],
    },
    {
      title: 'Contenido',
      items: [
        { title: 'Casos de Éxito', url: '/admin/case-studies', icon: FileText },
        { title: 'Operaciones', url: '/admin/operations', icon: Building2 },
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
        { title: 'Leads de Contacto', url: '/admin/contact-leads', icon: Mail },
        { title: 'Valoraciones', url: '/admin/valuation-leads', icon: Calculator },
        { title: 'Solicitudes Colaboradores', url: '/admin/collaborator-applications', icon: UserPlus },
      ],
    },
    {
      title: 'Usuarios',
      items: [
        { title: 'Equipo', url: '/admin/team', icon: Users },
        { title: 'Testimonios', url: '/admin/testimonials', icon: MessageSquare },
        { title: 'Test. Carrusel', url: '/admin/carousel-testimonials', icon: Star },
      ],
    },
    {
      title: 'Visuales',
      items: [
        { title: 'Logos Carrusel', url: '/admin/carousel-logos', icon: Image },
      ],
    },
  ];

  return (
    <Sidebar variant={variant} className="w-64 bg-white border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Capittal</h2>
            <p className="text-xs text-gray-500 font-medium">Panel Administrativo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/admin"
                  className={`flex items-center h-10 px-3 mx-3 rounded-lg font-medium text-sm transition-all duration-200 ${getNavClass('/admin', true)}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="ml-3">Inicio</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 mb-3">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center h-10 px-3 mx-3 rounded-lg font-medium text-sm transition-all duration-200 ${getNavClass(item.url)}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <div className="flex items-center justify-between w-full ml-3">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-medium">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Settings className="h-4 w-4 mr-3" />
            Configuración
          </Button>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
