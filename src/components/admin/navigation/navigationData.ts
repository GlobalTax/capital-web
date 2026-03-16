import {
  Home,
  Users,
  AlertCircle,
  Brain,
  ImageIcon,
  Workflow,
  TrendingUp,
  BarChart3,
  Building2,
  FileText,
  Database,
  Award,
  Mail,
  Target,
  Zap,
  PieChart,
  Globe,
  Settings,
  LayoutDashboard,
  UserPlus
} from 'lucide-react';

export interface NavigationItem {
  title: string;
  icon: React.ComponentType<any>;
  id: string;
  description: string;
  badge?: 'URGENTE' | 'AI';
  keywords?: string[];
}

export interface NavigationGroup {
  title: string;
  description: string;
  priority?: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    title: "🎯 Leads & Workflows",
    description: "Gestión completa del proceso comercial",
    priority: "high",
    items: [
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
      },
      {
        title: "Biblioteca de Fotos",
        icon: ImageIcon,
        id: "photo-library",
        description: "Gestiona y organiza fotos",
        keywords: ["fotos", "imágenes", "biblioteca", "media", "galería"]
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
      }
    ]
  },
  {
    title: "🔍 Search Funds Intelligence",
    description: "Gestión y matching de Search Funds",
    items: [
      {
        title: "Directorio SF",
        icon: Building2,
        id: "sf-directory",
        description: "Directorio de Search Funds",
        keywords: ["search", "funds", "directorio", "inversores"]
      },
      {
        title: "Backers",
        icon: Users,
        id: "sf-backers",
        description: "Gestión de backers e inversores",
        keywords: ["backers", "inversores", "sponsors"]
      },
      {
        title: "Matching Inbox",
        icon: Target,
        id: "sf-matches",
        description: "Matches pendientes de revisar",
        keywords: ["matches", "matching", "oportunidades"]
      }
    ]
  }
];

export const quickAccessItems: NavigationItem[] = [
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
