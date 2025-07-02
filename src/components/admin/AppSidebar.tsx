
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
  Mail,
  Target,
  Zap,
  PieChart,
  Globe,
  List
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<any>;
  id: string;
  description: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
}

const sidebarGroups = [
  {
    title: "🎯 LEADS & WORKFLOWS",
    description: "Gestión completa del proceso desde lead hasta reunión",
    priority: "high",
    items: [
      {
        title: "Lead Scoring",
        icon: Target,
        id: "lead-scoring",
        description: "Priorización de leads y alertas urgentes",
        badge: "URGENTE" as const
      },
      {
        title: "Contactos",
        icon: Users,
        id: "contacts",
        description: "Vista unificada de todos los contactos",
        badge: "NEW" as const
      },
      {
        title: "Listas y Segmentación",
        icon: List,
        id: "contact-lists",
        description: "Organiza y segmenta contactos"
      },
      {
        title: "Alertas",
        icon: AlertCircle,
        id: "alerts",
        description: "Notificaciones y eventos críticos",
        badge: "URGENTE" as const
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
      }
    ]
  },
  {
    title: "✉️ EMAIL MARKETING",
    description: "Campañas y automatizaciones de email",
    items: [
      {
        title: "Campañas de Email",
        icon: Mail,
        id: "email-marketing",
        description: "Gestión de campañas de email"
      },
      {
        title: "Marketing Automation",
        icon: Workflow,
        id: "marketing-automation",
        description: "Secuencias y workflows automatizados"
      }
    ]
  },
  {
    title: "🎨 CMS - CONTENIDO WEB",
    description: "Gestión de todo el contenido web",
    items: [
      {
        title: "AI Content Studio Pro",
        icon: FileText,
        id: "blog-v2",
        description: "Generación de contenido con IA",
        badge: "AI" as const
      },
      {
        title: "Reports Sectoriales IA",
        icon: Database,
        id: "sector-reports",
        description: "Generación de reportes sectoriales",
        badge: "AI" as const
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
        icon: Zap,
        id: "lead-magnets",
        description: "Gestión de lead magnets"
      }
    ]
  },
  {
    title: "📊 MARKETING INTELLIGENCE & ANALYTICS",
    description: "Análisis avanzado e insights con IA",
    items: [
      {
        title: "Marketing Intelligence",
        icon: Brain,
        id: "marketing-intelligence",
        description: "Análisis predictivo y insights",
        badge: "AI" as const
      },
      {
        title: "Marketing Hub",
        icon: PieChart,
        id: "marketing-hub",
        description: "Dashboard completo de métricas"
      },
      {
        title: "Integraciones",
        icon: Globe,
        id: "integrations",
        description: "Apollo, Google Ads, LinkedIn y más",
        badge: "NEW" as const
      }
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN & SISTEMA",
    description: "Configuración general",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        id: "dashboard",
        description: "Vista general de la plataforma"
      },
      {
        title: "Configuración",
        icon: Settings,
        id: "settings",
        description: "Ajustes generales de la plataforma"
      }
    ]
  }
];

const AppSidebar: React.FC = () => {
  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'URGENTE':
        return 'bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse';
      case 'AI':
        return 'bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full';
      case 'NEW':
        return 'bg-green-500 text-white text-xs px-2 py-0.5 rounded-full';
      default:
        return '';
    }
  };

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

      <nav className="space-y-6">
        {sidebarGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {group.title}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {group.description}
              </div>
            </div>
            
            <div className="space-y-1">
              {group.items.map((item) => (
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
                  <span className="truncate flex-1">{item.title}</span>
                  {item.badge && (
                    <span className={getBadgeStyles(item.badge)}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
