import React from 'react';
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  AlertCircle,
  Brain,
  Workflow
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
    title: "Configuración",
    icon: Settings,
    id: "settings",
    description: "Ajustes generales de la plataforma"
  }
];

const AppSidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full py-4 px-3">
      <div className="flex items-center justify-center mb-6">
        <NavLink to="/" className="text-xl font-bold text-blue-600">
          Capittal Admin
        </NavLink>
      </div>
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.id}
            to={`/admin/${item.id}`}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md
              ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;
