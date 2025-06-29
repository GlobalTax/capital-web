
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
  Calculator,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
}

const AdminSidebar = ({ collapsed }: AdminSidebarProps) => {
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
    const active = isActive(url, exact);
    return active 
      ? 'sidebar-link sidebar-link-active' 
      : 'sidebar-link sidebar-link-default';
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
    <div className={`sidebar ${collapsed ? 'w-16' : ''}`}>
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <h2 className="font-semibold text-slate-900 text-lg">Capittal</h2>
              <p className="text-xs text-slate-500 font-medium">Panel Administrativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 space-y-2">
        {/* Dashboard */}
        <div>
          <NavLink
            to="/admin"
            className={getNavClass('/admin', true)}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="transition-opacity duration-200">Inicio</span>
            )}
          </NavLink>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="sidebar-section-title transition-opacity duration-200">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={getNavClass(item.url)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full transition-opacity duration-200">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-md font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSidebar;
