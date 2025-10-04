import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  Calculator,
  BarChart3,
  Mail,
  Briefcase,
  Image,
  Video,
  Award,
  Building2,
  TrendingUp,
  BookOpen,
  Target
} from 'lucide-react';

const adminNavItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/admin',
    exact: true
  },
  {
    title: 'Valoraciones',
    icon: <Calculator className="h-5 w-5" />,
    href: '/admin/valuations'
  },
  {
    title: 'Gestión de Páginas',
    icon: <BookOpen className="h-5 w-5" />,
    href: '/admin/pages'
  },
  {
    title: 'Editor de Contenido',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/content-editor'
  },
  {
    title: 'Leads',
    icon: <Users className="h-5 w-5" />,
    href: '/admin/leads'
  },
  {
    title: 'Blog',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/blog'
  },
  {
    title: 'Casos de Éxito',
    icon: <Award className="h-5 w-5" />,
    href: '/admin/case-studies'
  },
  {
    title: 'Operaciones',
    icon: <Building2 className="h-5 w-5" />,
    href: '/admin/company-operations'
  },
  {
    title: 'Testimonios',
    icon: <MessageSquare className="h-5 w-5" />,
    href: '/admin/testimonials'
  },
  {
    title: 'Logos Carousel',
    icon: <Image className="h-5 w-5" />,
    href: '/admin/carousel-logos'
  },
  {
    title: 'Propuestas de Honorarios',
    icon: <Briefcase className="h-5 w-5" />,
    href: '/admin/fee-proposals'
  },
  {
    title: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/admin/analytics'
  },
  {
    title: 'Marketing Hub',
    icon: <TrendingUp className="h-5 w-5" />,
    href: '/admin/marketing-hub'
  },
  {
    title: 'Email Marketing',
    icon: <Mail className="h-5 w-5" />,
    href: '/admin/email-marketing'
  },
  {
    title: 'Configuración',
    icon: <Settings className="h-5 w-5" />,
    href: '/admin/settings'
  }
];

export const AdminSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Panel Admin</h2>
      </div>
      
      <nav className="mt-6">
        <div className="px-3">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};