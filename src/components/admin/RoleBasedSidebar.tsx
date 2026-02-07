import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { Badge } from '@/components/ui/badge';
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
  Lock,
  PauseCircle
} from 'lucide-react';

export function RoleBasedSidebar() {
  const location = useLocation();
  const { getMenuVisibility, userRole, isLoading } = useRoleBasedPermissions();

  const menuVisibility = getMenuVisibility();

  const menuSections = [
    {
      title: "Dashboard",
      items: [
        { 
          title: "Panel Principal", 
          url: "/admin", 
          icon: LayoutDashboard,
          visible: true // Dashboard siempre visible
        },
      ]
    },
    {
      title: "🎯 Leads & Workflows",
      items: [
        { 
          title: "Leads",
          url: "/admin/contacts", 
          icon: Mail,
          visible: menuVisibility.contactLeads
        },
        { 
          title: "Solicitudes Colaboradores", 
          url: "/admin/collaborator-applications", 
          icon: UserPlus,
          visible: menuVisibility.collaboratorApplications
        },
        { 
          title: "Marketing Automation", 
          url: "/admin/marketing-automation", 
          icon: Workflow,
          visible: menuVisibility.marketingAutomation
        },
        { 
          title: "Alertas", 
          url: "/admin/alerts", 
          icon: AlertCircle, 
          badge: "URGENTE",
          visible: menuVisibility.alerts
        },
        { 
          title: "Propuestas Honorarios", 
          url: "/admin/proposals", 
          icon: FileText, 
          badge: "NEW",
          visible: true
        },
      ]
    },
    {
      title: "🎨 Gestión de Contenido",
      items: [
        { 
          title: "AI Content Studio Pro", 
          url: "/admin/blog-v2", 
          icon: FileText, 
          badge: "AI",
          visible: menuVisibility.blogV2
        },
        { 
          title: "Reports Sectoriales IA", 
          url: "/admin/sector-reports", 
          icon: Database, 
          badge: "AI",
          visible: menuVisibility.sectorReports
        },
        { 
          title: "Casos de Éxito", 
          url: "/admin/case-studies", 
          icon: Award,
          visible: menuVisibility.caseStudies
        },
        { 
          title: "Lead Magnets", 
          url: "/admin/lead-magnets", 
          icon: Zap,
          visible: menuVisibility.leadMagnets
        },
      ]
    },
    {
      title: "🏢 Datos de Empresa",
      items: [
        { 
          title: "Operaciones", 
          url: "/admin/operations", 
          icon: Building2,
          visible: menuVisibility.operations
        },
        { 
          title: "Múltiplos", 
          url: "/admin/multiples", 
          icon: TrendingUp,
          visible: menuVisibility.multiples
        },
        { 
          title: "Estadísticas", 
          url: "/admin/statistics", 
          icon: BarChart3,
          visible: menuVisibility.statistics
        },
        { 
          title: "Deals Paused", 
          url: "/admin/deals-paused", 
          icon: PauseCircle,
          visible: true
        },
      ]
    },
    {
      title: "👥 Equipo & Testimonios",
      items: [
        { 
          title: "Equipo", 
          url: "/admin/team", 
          icon: Users,
          visible: menuVisibility.team
        },
        { 
          title: "Testimonios", 
          url: "/admin/testimonials", 
          icon: MessageSquare,
          visible: menuVisibility.testimonials
        },
        { 
          title: "Test. Carrusel", 
          url: "/admin/carousel-testimonials", 
          icon: TestTube,
          visible: menuVisibility.carouselTestimonials
        },
        { 
          title: "Logos Carrusel", 
          url: "/admin/carousel-logos", 
          icon: Image,
          visible: menuVisibility.carouselLogos
        },
      ]
    },
    {
      title: "📊 Analytics & Intelligence",
      items: [
        { 
          title: "Marketing Intelligence", 
          url: "/admin/marketing-intelligence", 
          icon: Brain, 
          badge: "AI",
          visible: menuVisibility.marketingIntelligence
        },
        { 
          title: "Marketing Hub", 
          url: "/admin/marketing-hub", 
          icon: PieChart,
          visible: menuVisibility.marketingHub
        },
      ]
    },
    {
      title: "⚙️ Configuración",
      items: [
        { 
          title: "Usuarios Admin", 
          url: "/admin/admin-users", 
          icon: Users, 
          badge: "NEW",
          visible: menuVisibility.adminUsers
        },
        { 
          title: "Ajustes", 
          url: "/admin/settings", 
          icon: Settings,
          visible: menuVisibility.settings
        },
      ]
    }
  ];

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

  if (isLoading) {
    return (
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Admin Panel</h2>
              <p className="text-xs text-gray-500">Cargando...</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Cargando permisos...</p>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar-background" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
            <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-sidebar-foreground">Capittal Admin</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-sidebar-foreground/60">Panel de Control</p>
              <Badge variant="outline" className="text-xs border-sidebar-border text-sidebar-foreground/80">
                {userRole}
              </Badge>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => {
          // Filtrar items visibles
          const visibleItems = section.items.filter(item => item.visible);
          
          // Si no hay items visibles, no mostrar la sección
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.title} className="px-3">
              <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                   {visibleItems.map((item) => (
                     <SidebarMenuItem key={item.title}>
                       <SidebarMenuButton 
                         asChild
                         isActive={location.pathname === item.url}
                         className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors rounded-md"
                       >
                         <Link to={item.url} className="flex items-center justify-between w-full px-2 py-2">
                           <div className="flex items-center gap-3">
                             <item.icon className="h-4 w-4 text-sidebar-foreground/70" />
                             <span className="text-sm font-medium text-sidebar-foreground">{item.title}</span>
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
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <Link 
          to="/" 
          className="flex items-center gap-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors px-2 py-2 rounded-md hover:bg-sidebar-accent/50"
        >
          <Home className="h-4 w-4" />
          Volver al sitio web
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}

export default RoleBasedSidebar;