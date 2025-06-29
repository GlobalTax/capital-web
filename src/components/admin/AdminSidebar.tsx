
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
    const baseClasses = "flex items-center h-10 px-3 mx-2 rounded-lg font-medium text-sm transition-all duration-200 relative group";
    return isActive(url, exact)
      ? `${baseClasses} bg-gray-900 text-white shadow-sm`
      : `${baseClasses} text-gray-700 hover:text-gray-900 hover:bg-gray-100`;
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
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-sm flex-shrink-0`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-sm">C</span>
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <h2 className="font-semibold text-gray-900 text-lg">Capittal</h2>
              <p className="text-xs text-gray-500 font-medium">Panel Administrativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Dashboard */}
        <div className="mb-4">
          <div className="space-y-1">
            <NavLink
              to="/admin"
              className={getNavClass('/admin', true)}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 transition-opacity duration-200">Inicio</span>
              )}
              {isActive('/admin', true) && (
                <div className="absolute right-2 w-1 h-5 bg-white rounded-full opacity-80" />
              )}
            </NavLink>
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 mb-2 transition-opacity duration-200">
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
                    <div className="flex items-center justify-between w-full ml-3 transition-opacity duration-200">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-md font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  {isActive(item.url) && (
                    <div className="absolute right-2 w-1 h-5 bg-white rounded-full opacity-80" />
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
