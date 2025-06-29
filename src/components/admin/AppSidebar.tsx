import React from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  AlertCircle,
  Brain,
  Workflow,
  TrendingUp,
  BarChart3,
  Building2,
  FileText,
  Database,
  MessageSquare,
  TestTube,
  Image,
  UserPlus,
  Award,
  Mail
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<any>;
  id: string;
  description: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
    description: "Vista general de la plataforma"
  },
  {
    title: "Marketing Intelligence",
    icon: Brain,
    id: "marketing-intelligence",
    description: "Análisis predictivo y insights"
  },
  {
    title: "Lead Scoring",
    icon: TrendingUp,
    id: "lead-scoring",
    description: "Priorización de leads y alertas"
  },
  {
    title: "Marketing Automation",
    icon: Workflow,
    id: "marketing-automation",
    description: "Secuencias, A/B testing y workflows"
  },
  {
    title: "Marketing Hub",
    icon: BarChart3,
    id: "marketing-hub",
    description: "Dashboard completo de métricas"
  },
  {
    title: "CRM",
    icon: Users,
    id: "crm",
    description: "Gestión de clientes y contactos"
  },
  {
    title: "Alertas",
    icon: AlertCircle,
    id: "alerts",
    description: "Notificaciones y eventos críticos"
  },
  {
    title: "Integraciones",
    icon: Settings,
    id: "integrations",
    description: "Apollo, Google Ads, LinkedIn y más"
  },
  {
    title: "Casos de Éxito",
    icon: Award,
    id: "case-studies",
    description: "Gestión de casos de éxito"
  },
  {
    title: "Operaciones",
    icon: Building2,
    id: "operations",
    description: "Gestión de operaciones"
  },
  {
    title: "AI Content Studio Pro",
    icon: FileText,
    id: "blog-v2",
    description: "Generación de contenido con IA"
  },
  {
    title: "Reports Sectoriales IA",
    icon: Database,
    id: "sector-reports",
    description: "Generación de reportes sectoriales"
  },
  {
    title: "Múltiplos",
    icon: TrendingUp,
    id: "multiples",
    description: "Gestión de múltiplos de valoración"
  },
  {
    title: "Estadísticas",
    icon: BarChart3,
    id: "statistics",
    description: "Métricas y estadísticas"
  },
  {
    title: "Leads de Contacto",
    icon: Mail,
    id: "contact-leads",
    description: "Gestión de leads de contacto"
  },
  {
    title: "Solicitudes Colaboradores",
    icon: UserPlus,
    id: "collaborator-applications",
    description: "Gestión de solicitudes de colaboradores"
  },
  {
    title: "Equipo",
    icon: Users,
    id: "team",
    description: "Gestión del equipo"
  },
  {
    title: "Testimonios",
    icon: MessageSquare,
    id: "testimonials",
    description: "Gestión de testimonios"
  },
  {
    title: "Test. Carrusel",
    icon: TestTube,
    id: "carousel-testimonials",
    description: "Testimonios en carrusel"
  },
  {
    title: "Logos Carrusel",
    icon: Image,
    id: "carousel-logos",
    description: "Logos en carrusel"
  },
  {
    title: "Lead Magnets",
    icon: FileText,
    id: "lead-magnets",
    description: "Gestión de lead magnets"
  },
  {
    title: "Configuración",
    icon: Settings,
    id: "settings",
    description: "Ajustes generales de la plataforma"
  }
];

const AppSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full py-4 px-3 overflow-y-auto">
      <div className="flex items-center justify-center mb-6">
        <NavLink to="/" className="text-xl font-bold text-blue-600">
          Capittal Admin
        </NavLink>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar en el panel..."
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <nav className="space-y-1">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Panel Principal
        </div>
        
        {sidebarItems.slice(0, 8).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
            {item.id === 'marketing-intelligence' && (
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                AI
              </span>
            )}
            {item.id === 'integrations' && (
              <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                NEW
              </span>
            )}
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
          Contenido IA
        </div>
        
        {sidebarItems.slice(8, 12).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
            {(item.id === 'blog-v2' || item.id === 'sector-reports') && (
              <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                NE
              </span>
            )}
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
          Datos
        </div>
        
        {sidebarItems.slice(12, 14).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
          Leads
        </div>
        
        {sidebarItems.slice(14, 16).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
          Usuarios
        </div>
        
        {sidebarItems.slice(16, 18).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 mt-6">
          Visuales
        </div>
        
        {sidebarItems.slice(18, 21).map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </NavLink>
        ))}

        <div className="border-t border-gray-200 mt-6 pt-4">
          {sidebarItems.slice(21).map((item) => (
            <NavLink
              key={item.id}
              to={`/admin/${item.id}`}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
              }
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default AppSidebar;
