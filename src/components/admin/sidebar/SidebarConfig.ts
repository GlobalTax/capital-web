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