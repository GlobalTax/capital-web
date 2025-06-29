
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Brain,
} from 'lucide-react';
import { SearchForm } from './SearchForm';
import { VersionSwitcher } from './VersionSwitcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

const data = {
  navMain: [
    {
      title: "Panel Principal",
      items: [
        {
          title: "Inicio",
          url: "/admin",
          icon: LayoutDashboard,
          isActive: false,
        },
        {
          title: "Marketing Intelligence",
          url: "/admin/marketing-intelligence",
          icon: Brain,
          badge: "AI",
          isActive: false,
        },
      ],
    },
    {
      title: "Contenido IA",
      items: [
        {
          title: "AI Content Studio Pro",
          url: "/admin/blog-v2",
          icon: PenTool,
          badge: "NEW",
          isActive: false,
        },
        {
          title: "Reports Sectoriales IA",
          url: "/admin/sector-reports",
          icon: BookOpen,
          badge: "NEW",
          isActive: false,
        },
      ],
    },
    {
      title: "Contenido",
      items: [
        {
          title: "Casos de Éxito",
          url: "/admin/case-studies",
          icon: FileText,
          isActive: false,
        },
        {
          title: "Operaciones",
          url: "/admin/operations",
          icon: Building2,
          isActive: false,
        },
      ],
    },
    {
      title: "Datos",
      items: [
        {
          title: "Múltiplos",
          url: "/admin/multiples",
          icon: BarChart3,
          isActive: false,
        },
        {
          title: "Estadísticas",
          url: "/admin/statistics",
          icon: TrendingUp,
          isActive: false,
        },
      ],
    },
    {
      title: "Leads",
      items: [
        {
          title: "Leads de Contacto",
          url: "/admin/contact-leads",
          icon: Mail,
          isActive: false,
        },
        {
          title: "Solicitudes Colaboradores",
          url: "/admin/collaborator-applications",
          icon: UserPlus,
          isActive: false,
        },
      ],
    },
    {
      title: "Usuarios",
      items: [
        {
          title: "Equipo",
          url: "/admin/team",
          icon: Users,
          isActive: false,
        },
        {
          title: "Testimonios",
          url: "/admin/testimonials",
          icon: MessageSquare,
          isActive: false,
        },
        {
          title: "Test. Carrusel",
          url: "/admin/carousel-testimonials",
          icon: Star,
          isActive: false,
        },
      ],
    },
    {
      title: "Visuales",
      items: [
        {
          title: "Logos Carrusel",
          url: "/admin/carousel-logos",
          icon: Image,
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (url: string) => {
    if (url === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(url);
  };

  const updatedData = {
    ...data,
    navMain: data.navMain.map(group => ({
      ...group,
      items: group.items.map(item => ({
        ...item,
        isActive: isActive(item.url)
      }))
    }))
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {updatedData.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((menuItem) => (
                  <SidebarMenuItem key={menuItem.title}>
                    <SidebarMenuButton asChild isActive={menuItem.isActive}>
                      <NavLink to={menuItem.url} className="flex items-center gap-2">
                        <menuItem.icon className="size-4" />
                        <span>{menuItem.title}</span>
                        {menuItem.badge && (
                          <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {menuItem.badge}
                          </span>
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
      <SidebarRail />
    </Sidebar>
  );
}
