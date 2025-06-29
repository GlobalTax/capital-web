
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
  ChevronDown,
  ChevronRight,
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
    return isActive(url, exact)
      ? "bg-gray-900 text-white flex items-center h-10 px-3 rounded-md font-normal w-full transition-colors duration-200"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center h-10 px-3 rounded-md font-normal w-full transition-colors duration-200";
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
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-medium text-sm">C</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-medium text-gray-900 text-lg">Capittal</h2>
              <p className="text-xs text-gray-500 font-light">Panel Administrativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Dashboard */}
        <div className="px-4 py-6">
          <div className="space-y-1">
            <NavLink
              to="/admin"
              className={getNavClass('/admin', true)}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm ml-2">Inicio</span>}
            </NavLink>
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group) => (
          <div key={group.title} className="px-4 py-2">
            {!collapsed && (
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 mb-2">
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
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between w-full ml-2">
                      <span className="text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded">
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
