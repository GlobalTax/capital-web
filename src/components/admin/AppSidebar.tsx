
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
  badge?: 'URGENTE' | 'AI' | 'NEW' | 'INSIGHTS';
}

const sidebarGroups = [
  {
    title: "📊 DASHBOARD",
    description: "Visión general y métricas principales",
    priority: "high",
    items: [
      {
        title: "Dashboard Principal",
        icon: LayoutDashboard,
        id: "dashboard",
        description: "Resumen ejecutivo y KPIs"
      },
      {
        title: "Marketing Hub",
        icon: PieChart,
        id: "marketing-hub",
        description: "Analytics completo de marketing"
      },
      {
        title: "Performance Contenido",
        icon: BarChart3,
        id: "content-performance",
        description: "Análisis de rendimiento de contenido"
      }
    ]
  },
  {
    title: "🎯 LEADS & CRM",
    description: "Gestión de leads y proceso comercial",
    priority: "high",
    items: [
      {
        title: "Lead Scoring",
        icon: Target,
        id: "lead-scoring",
        description: "Priorización inteligente de leads",
        badge: "URGENTE" as const
      },
      {
        title: "Contactos",
        icon: Users,
        id: "contacts",
        description: "Base de datos de contactos",
        badge: "NEW" as const
      },
      {
        title: "Valoraciones",
        icon: TrendingUp,
        id: "company-valuations",
        description: "Solicitudes de valoración"
      },
      {
        title: "Formularios Incompletos",
        icon: AlertCircle,
        id: "incomplete-valuations",
        description: "Análisis de abandono",
        badge: "INSIGHTS" as const
      },
      {
        title: "Leads de Contacto",
        icon: Mail,
        id: "contact-leads",
        description: "Formularios de contacto"
      },
      {
        title: "Alertas",
        icon: AlertCircle,
        id: "alerts",
        description: "Notificaciones críticas",
        badge: "URGENTE" as const
      }
    ]
  },
  {
    title: "🎨 CONTENIDO & CMS",
    description: "Gestión de contenido web",
    items: [
      {
        title: "AI Content Studio",
        icon: Brain,
        id: "blog-v2",
        description: "Generación de contenido IA",
        badge: "AI" as const
      },
      {
        title: "Casos de Éxito",
        icon: Award,
        id: "case-studies",
        description: "Portfolio de casos"
      },
      {
        title: "Operaciones",
        icon: Building2,
        id: "operations",
        description: "Historial de operaciones"
      },
      {
        title: "Lead Magnets",
        icon: Zap,
        id: "lead-magnets",
        description: "Recursos descargables"
      }
    ]
  },
  {
    title: "✉️ MARKETING",
    description: "Campañas y automatización",
    items: [
      {
        title: "Email Marketing",
        icon: Mail,
        id: "email-marketing",
        description: "Campañas de email"
      },
      {
        title: "Automation",
        icon: Workflow,
        id: "marketing-automation",
        description: "Workflows automatizados"
      },
      {
        title: "Segmentación",
        icon: List,
        id: "contact-lists",
        description: "Listas y segmentos"
      }
    ]
  },
  {
    title: "🌐 WEB & MARCA",
    description: "Elementos web y corporativos",
    items: [
      {
        title: "Equipo",
        icon: Users,
        id: "team",
        description: "Miembros del equipo"
      },
      {
        title: "Testimonios",
        icon: MessageSquare,
        id: "testimonials",
        description: "Reseñas de clientes"
      },
      {
        title: "Múltiplos",
        icon: Database,
        id: "multiples",
        description: "Ratios de valoración"
      },
      {
        title: "Estadísticas",
        icon: BarChart3,
        id: "statistics",
        description: "Métricas del sector"
      }
    ]
  },
  {
    title: "⚙️ SISTEMA",
    description: "Configuración y herramientas",
    items: [
      {
        title: "Integraciones",
        icon: Globe,
        id: "integrations",
        description: "Conexiones externas",
        badge: "NEW" as const
      },
      {
        title: "Colaboradores",
        icon: UserPlus,
        id: "collaborator-applications",
        description: "Solicitudes de trabajo"
      },
      {
        title: "Configuración",
        icon: Settings,
        id: "settings",
        description: "Ajustes del sistema"
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
      case 'INSIGHTS':
        return 'bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full';
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
