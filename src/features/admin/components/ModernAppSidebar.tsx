
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Users, 
  BarChart3,
  Shield,
  Home,
  Mail,
  UserPlus,
  Workflow,
  Brain,
  PieChart,
  Globe,
  FileText,
  Database,
  Award,
  Building2,
  TrendingUp,
  Zap,
  MessageSquare,
  TestTube,
  Image,
  AlertCircle,
  Flag
} from 'lucide-react';

const menuSections = [
  {
    title: "Dashboard",
    items: [
      { title: "Panel Principal", url: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    title: "🎯 Leads & Workflows",
    items: [
      { title: "Lead Scoring", url: "/admin/lead-scoring", icon: Target, badge: "URGENTE" },
      { title: "Reglas de Scoring", url: "/admin/lead-scoring-rules", icon: BarChart3 },
      { title: "Leads de Contacto", url: "/admin/contact-leads", icon: Mail },
      { title: "Solicitudes Colaboradores", url: "/admin/collaborator-applications", icon: UserPlus },
      { title: "Marketing Automation", url: "/admin/marketing-automation", icon: Workflow },
      { title: "Alertas", url: "/admin/alerts", icon: AlertCircle, badge: "URGENTE" },
    ]
  },
  {
    title: "🎨 Gestión de Contenido",
    items: [
      { title: "AI Content Studio Pro", url: "/admin/blog-v2", icon: FileText, badge: "AI" },
      { title: "Reports Sectoriales IA", url: "/admin/sector-reports", icon: Database, badge: "AI" },
      { title: "Casos de Éxito", url: "/admin/case-studies", icon: Award },
      { title: "Lead Magnets", url: "/admin/lead-magnets", icon: Zap },
      { title: "Banners", url: "/admin/banners", icon: Flag },
    ]
  },
  {
    title: "🏢 Datos de Empresa",
    items: [
      { title: "Operaciones", url: "/admin/operations", icon: Building2 },
      { title: "Múltiplos", url: "/admin/multiples", icon: TrendingUp },
      { title: "Estadísticas", url: "/admin/statistics", icon: BarChart3 },
    ]
  },
  {
    title: "👥 Equipo & Testimonios",
    items: [
      { title: "Equipo", url: "/admin/team", icon: Users },
      { title: "Testimonios", url: "/admin/testimonials", icon: MessageSquare },
      { title: "Test. Carrusel", url: "/admin/carousel-testimonials", icon: TestTube },
      { title: "Logos Carrusel", url: "/admin/carousel-logos", icon: Image },
    ]
  },
  {
    title: "📊 Analytics & Intelligence",
    items: [
      { title: "Marketing Intelligence", url: "/admin/marketing-intelligence", icon: Brain, badge: "AI" },
      { title: "Marketing Hub", url: "/admin/marketing-hub", icon: PieChart },
      { title: "Integraciones", url: "/admin/integrations", icon: Globe, badge: "NEW" },
    ]
  },
  {
    title: "⚙️ Configuración",
    items: [
      { title: "Usuarios Admin", url: "/admin/admin-users", icon: Users, badge: "NEW" },
      { title: "Ajustes", url: "/admin/settings", icon: Settings },
    ]
  }
];

export default function ModernAppSidebar() {
  const location = useLocation();
  const { getMenuVisibility, userRole } = useRoleBasedPermissions();

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
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-xs text-gray-500">Capittal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className={getBadgeStyles(item.badge)}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Home className="h-4 w-4" />
          Volver al sitio web
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
