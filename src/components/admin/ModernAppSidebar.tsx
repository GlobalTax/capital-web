
import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
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
  Settings,
  LayoutDashboard,
  Search,
  Command
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarInput,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { VersionSwitcher } from './VersionSwitcher';
import { SearchForm } from './SearchForm';

interface NavigationItem {
  title: string;
  icon: React.ComponentType<any>;
  id: string;
  description: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
  keywords?: string[];
}

const navigationGroups = [
  {
    title: "🎯 Leads & Workflows",
    description: "Gestión completa del proceso comercial",
    priority: "high",
    items: [
      {
        title: "Lead Scoring",
        icon: Target,
        id: "lead-scoring",
        description: "Priorización de leads y alertas urgentes",
        badge: "URGENTE" as const,
        keywords: ["leads", "scoring", "puntuación", "alertas", "urgente"]
      },
      {
        title: "CRM",
        icon: Users,
        id: "crm",
        description: "Gestión de clientes y contactos",
        keywords: ["crm", "clientes", "contactos", "gestión"]
      },
      {
        title: "Marketing Automation",
        icon: Workflow,
        id: "marketing-automation",
        description: "Secuencias y workflows automatizados",
        keywords: ["automation", "workflows", "secuencias", "marketing"]
      },
      {
        title: "Alertas",
        icon: AlertCircle,
        id: "alerts",
        description: "Notificaciones y eventos críticos",
        badge: "URGENTE" as const,
        keywords: ["alertas", "notificaciones", "eventos", "críticos"]
      },
      {
        title: "Leads de Contacto",
        icon: Mail,
        id: "contact-leads",
        description: "Gestión de leads de contacto",
        keywords: ["leads", "contacto", "formularios"]
      },
      {
        title: "Solicitudes Colaboradores",
        icon: UserPlus,
        id: "collaborator-applications",
        description: "Gestión de solicitudes de colaboradores",
        keywords: ["colaboradores", "solicitudes", "aplicaciones"]
      }
    ]
  },
  {
    title: "🎨 Gestión de Contenido",
    description: "CMS y generación de contenido",
    items: [
      {
        title: "AI Content Studio Pro",
        icon: FileText,
        id: "blog-v2",
        description: "Generación de contenido con IA",
        badge: "AI" as const,
        keywords: ["blog", "contenido", "ai", "artificial", "generación"]
      },
      {
        title: "Reports Sectoriales IA",
        icon: Database,
        id: "sector-reports",
        description: "Generación de reportes sectoriales",
        badge: "AI" as const,
        keywords: ["reports", "sectores", "informes", "ai"]
      },
      {
        title: "Casos de Éxito",
        icon: Award,
        id: "case-studies",
        description: "Gestión de casos de éxito",
        keywords: ["casos", "éxito", "testimonios", "clientes"]
      },
      {
        title: "Operaciones",
        icon: Building2,
        id: "operations",
        description: "Gestión de operaciones",
        keywords: ["operaciones", "transacciones", "deals"]
      },
      {
        title: "Múltiplos",
        icon: TrendingUp,
        id: "multiples",
        description: "Gestión de múltiplos de valoración",
        keywords: ["múltiplos", "valoración", "ratios", "financiero"]
      },
      {
        title: "Estadísticas",
        icon: BarChart3,
        id: "statistics",
        description: "Métricas y estadísticas",
        keywords: ["estadísticas", "métricas", "analytics", "datos"]
      },
      {
        title: "Equipo",
        icon: Users,
        id: "team",
        description: "Gestión del equipo",
        keywords: ["equipo", "team", "miembros", "personal"]
      },
      {
        title: "Lead Magnets",
        icon: Zap,
        id: "lead-magnets",
        description: "Gestión de lead magnets",
        keywords: ["lead", "magnets", "recursos", "descargas"]
      }
    ]
  },
  {
    title: "📊 Analytics & Intelligence",
    description: "Análisis avanzado e inteligencia de marketing",
    items: [
      {
        title: "Marketing Intelligence",
        icon: Brain,
        id: "marketing-intelligence",
        description: "Análisis predictivo y insights",
        badge: "AI" as const,
        keywords: ["intelligence", "predictivo", "insights", "análisis"]
      },
      {
        title: "Marketing Hub",
        icon: PieChart,
        id: "marketing-hub",
        description: "Dashboard completo de métricas",
        keywords: ["hub", "dashboard", "métricas", "marketing"]
      },
      {
        title: "Integraciones",
        icon: Globe,
        id: "integrations",
        description: "Apollo, Google Ads, LinkedIn y más",
        badge: "NEW" as const,
        keywords: ["integraciones", "apollo", "google", "ads", "linkedin"]
      }
    ]
  }
];

const quickAccessItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    id: "dashboard",
    description: "Vista general de la plataforma",
    keywords: ["dashboard", "inicio", "general", "resumen"]
  },
  {
    title: "Configuración",
    icon: Settings,
    id: "settings",
    description: "Ajustes generales de la plataforma",
    keywords: ["configuración", "ajustes", "settings", "opciones"]
  }
];

export function ModernAppSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';

  // Combinar todos los items para la búsqueda
  const allItems = useMemo(() => {
    const items: NavigationItem[] = [];
    navigationGroups.forEach(group => {
      items.push(...group.items);
    });
    items.push(...quickAccessItems);
    return items;
  }, []);

  // Filtrar items basado en la búsqueda
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    
    const query = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(query))
    );
  }, [searchQuery, allItems]);

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'URGENTE':
        return 'bg-red-500 text-white animate-pulse';
      case 'AI':
        return 'bg-blue-500 text-white';
      case 'NEW':
        return 'bg-green-500 text-white';
      default:
        return '';
    }
  };

  const isActive = (path: string) => location.pathname === `/admin/${path}`;

  // Mostrar resultados de búsqueda si hay query
  if (searchQuery.trim()) {
    return (
      <Sidebar className="border-r border-gray-200">
        <SidebarHeader className="p-4">
          <VersionSwitcher />
          <div className="mt-4">
            <SearchForm onSearch={setSearchQuery} value={searchQuery} />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Resultados ({filteredItems.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.id)}
                      className="group"
                    >
                      <NavLink to={`/admin/${item.id}`}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate">{item.title}</span>
                            {item.badge && (
                              <SidebarMenuBadge className={getBadgeStyles(item.badge)}>
                                {item.badge}
                              </SidebarMenuBadge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4">
        <VersionSwitcher />
        <div className="mt-4">
          <SearchForm onSearch={setSearchQuery} value={searchQuery} />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Acceso Rápido */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            ⚡ Acceso Rápido
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.id)}
                    size="sm"
                  >
                    <NavLink to={`/admin/${item.id}`}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupos principales - sin defaultOpen */}
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {group.title}
            </SidebarGroupLabel>
            {!isCollapsed && (
              <div className="text-xs text-gray-400 px-2 mb-2">
                {group.description}
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive(item.id)}
                      className="group relative"
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <NavLink to={`/admin/${item.id}`}>
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-1.5 py-0.5 ${getBadgeStyles(item.badge)}`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
