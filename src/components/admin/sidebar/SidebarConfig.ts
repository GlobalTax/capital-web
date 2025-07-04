import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Users, 
  BarChart3,
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
  List,
  Contact
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
  description?: string;
  visible?: boolean;
}

export interface SidebarSection {
  title: string;
  description: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    description: "Panel principal",
    items: [
      { 
        title: "Panel Principal", 
        url: "/admin", 
        icon: LayoutDashboard,
        description: "Vista general de la plataforma"
      },
    ]
  },
  {
    title: "🎯 LEADS & CONTACTOS",
    description: "Gestión completa de leads y contactos",
    items: [
      { 
        title: "Dashboard de Leads", 
        url: "/admin/leads-dashboard", 
        icon: Target, 
        badge: "NEW",
        description: "Dashboard mejorado de leads con visualización completa"
      },
      { 
        title: "Lead Scoring", 
        url: "/admin/lead-scoring", 
        icon: BarChart3,
        description: "Puntuación y análisis de leads"
      },
      { 
        title: "Contactos", 
        url: "/admin/contacts", 
        icon: Contact,
        description: "Vista unificada de todos los contactos"
      },
      { 
        title: "Listas y Segmentación", 
        url: "/admin/contact-lists", 
        icon: List,
        description: "Organiza y segmenta contactos"
      },
      { 
        title: "Propuestas de Honorarios", 
        url: "/admin/proposals", 
        icon: FileText,
        description: "Gestión de propuestas comerciales"
      },
    ]
  },
  {
    title: "📧 MARKETING",
    description: "Campañas y automatización",
    items: [
      {
        title: "Campañas de Email",
        url: "/admin/email-marketing",
        icon: Mail,
        description: "Gestión de campañas de email"
      },
      {
        title: "Marketing Automation",
        url: "/admin/marketing-automation",
        icon: Workflow,
        description: "Secuencias y workflows automatizados"
      },
      { 
        title: "Marketing Hub", 
        url: "/admin/marketing-hub", 
        icon: PieChart,
        description: "Dashboard completo de métricas"
      },
    ]
  },
  {
    title: "📝 CONTENIDO",
    description: "Gestión de contenido",
    items: [
      { 
        title: "Blog y Contenido", 
        url: "/admin/blog-v2", 
        icon: FileText, 
        badge: "AI",
        description: "Generación de contenido con IA"
      },
      { 
        title: "Casos de Éxito", 
        url: "/admin/case-studies", 
        icon: Award,
        description: "Gestión de casos de éxito"
      },
      { 
        title: "Lead Magnets", 
        url: "/admin/lead-magnets", 
        icon: Zap,
        description: "Gestión de lead magnets"
      },
    ]
  },
  {
    title: "🏢 DATOS EMPRESARIALES",
    description: "Información corporativa",
    items: [
      { 
        title: "Operaciones", 
        url: "/admin/operations", 
        icon: Building2,
        description: "Gestión de operaciones"
      },
      { 
        title: "Múltiplos", 
        url: "/admin/multiples", 
        icon: TrendingUp,
        description: "Múltiplos de valoración"
      },
      { 
        title: "Equipo", 
        url: "/admin/team", 
        icon: Users,
        description: "Gestión del equipo"
      },
      { 
        title: "Testimonios", 
        url: "/admin/testimonials", 
        icon: MessageSquare,
        description: "Gestión de testimonios"
      },
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN",
    description: "Configuración del sistema",
    items: [
      { 
        title: "Usuarios Admin", 
        url: "/admin/admin-users", 
        icon: Users,
        description: "Gestión de usuarios administradores"
      },
      { 
        title: "Ajustes", 
        url: "/admin/settings", 
        icon: Settings,
        description: "Configuración general"
      },
    ]
  }
];