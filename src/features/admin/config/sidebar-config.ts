// ============= ADMIN SIDEBAR CONFIGURATION =============
// Configuración centralizada para la navegación del admin
// 8 secciones consolidadas

import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Users, 
  BarChart3,
  FileText,
  Award,
  Building2,
  TrendingUp,
  Zap,
  MessageSquare,
  Sparkles,
  Eye,
  Palette,
  ClipboardList,
  Tags,
  Image,
  Calculator,
  Megaphone,
  Briefcase,
  Store,
  Mail,
  Kanban,
  CalendarDays,
  Bell,
  UserPlus,
  Shield,
  Newspaper,
  Search,
  Globe,
  ShoppingCart,
  PanelLeft,
  Landmark,
  RefreshCw,
  Calendar,
  FolderOpen,
  Send,
  Cog,
  Database,
  Phone,
  FileCheck,
  Crosshair,
  PauseCircle,
  Upload,
  Wallet,
  Bot,
  Presentation,
  DollarSign,
  Wrench,
  BriefcaseBusiness,
  FileSpreadsheet,
  ListChecks,
  LayoutTemplate,
  UserCheck
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI';
  description?: string;
  visible?: boolean;
}

export interface SidebarSection {
  title: string;
  icon?: LucideIcon;
  description: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  // ─── 1. DASHBOARD ───
  {
    title: "DASHBOARD",
    icon: LayoutDashboard,
    description: "Panel principal",
    items: [
      { title: "Vista General", url: "/admin", icon: LayoutDashboard, description: "Dashboard principal" },
      { title: "Calendario Editorial", url: "/admin/content-calendar", icon: Calendar, description: "Calendario de contenido editorial" },
      { title: "Search Analytics", url: "/admin/search-analytics", icon: Search, description: "Análisis de búsquedas" },
    ]
  },

  // ─── 2. CRM & LEADS ───
  {
    title: "LEADS",
    icon: Target,
    description: "Gestión comercial",
    items: [
      { title: "Leads (Todos)", url: "/admin/contacts", icon: Target, description: "Vista completa de todos los leads" },
      { title: "Pipeline Ventas", url: "/admin/leads-pipeline", icon: Kanban, description: "Tablero Kanban de leads de venta" },
      { title: "Pipeline Compras", url: "/admin/buy-pipeline", icon: ShoppingCart, description: "Tablero Kanban de leads de compra" },
      { title: "Contactos Compra", url: "/admin/buyer-contacts", icon: ShoppingCart, description: "Contactos campaña compras" },
      { title: "Prospectos", url: "/admin/prospectos", icon: Crosshair, description: "Prospectos comerciales" },
      { title: "Mandatos Compra", url: "/admin/mandatos-compra", icon: BriefcaseBusiness, description: "Mandatos de compra activos" },
      { title: "Deals Pausados", url: "/admin/deals-paused", icon: PauseCircle, description: "Deals en pausa" },
      { title: "Reservas Llamadas", url: "/admin/bookings", icon: Phone, description: "Reservas de llamadas" },
      { title: "Gestión NDAs", url: "/admin/ndas", icon: FileCheck, description: "Gestión de NDAs firmados" },
      { title: "Entrada Manual Leads", url: "/admin/calculadora-manual", icon: UserPlus, description: "Introducir leads de Meta/externos" },
      { title: "Listas de Empresas", url: "/admin/listas-contacto", icon: ClipboardList, description: "Gestiona y depura listas de empresas" },
      { title: "Campañas Outbound", url: "/admin/campanas-valoracion", icon: Megaphone, description: "Campañas masivas de valoración por sector" },
      { title: "Valoraciones Pro", url: "/admin/valoraciones-pro", icon: Calculator, description: "Sistema de valoración profesional" },
    ]
  },

  // ─── 3. DIRECTORIO EMPRESAS (standalone) ───
  {
    title: "DIRECTORIO EMPRESAS",
    icon: Database,
    description: "Base de datos total de empresas",
    items: [
      { title: "Directorio Empresas", url: "/admin/empresas", icon: Database, description: "Base de datos de empresas" },
    ]
  },

  // ─── 4. INVERSORES ───
  {
    title: "INVERSORES",
    icon: Building2,
    description: "Directorios de fondos e inversores",
    items: [
      { title: "Directorio Corporativos", url: "/admin/corporate-buyers", icon: Landmark, description: "Compradores corporativos y estratégicos" },
      { title: "Capital Riesgo (CR)", url: "/admin/cr-directory", icon: TrendingUp, description: "Fondos y personas PE/VC" },
      { title: "Apollo Import CR", url: "/admin/cr-apollo-import", icon: Upload, description: "Importar fondos CR desde Apollo" },
      { title: "Portfolio CR", url: "/admin/cr-portfolio-list", icon: Wallet, description: "Portfolio de fondos CR" },
      { title: "Portfolio Scraper CR", url: "/admin/cr-portfolio-scraper", icon: RefreshCw, description: "Scraper de portfolios CR" },
      { title: "Fund Intelligence", url: "/admin/fund-intelligence", icon: BarChart3, description: "Inteligencia de fondos" },
      { title: "Search Funds (SF)", url: "/admin/sf-directory", icon: Search, description: "Directorio de Search Funds" },
      { title: "Apollo Import SF", url: "/admin/sf-apollo-import", icon: Upload, description: "Importar SF desde Apollo" },
      { title: "Radar SF", url: "/admin/sf-radar", icon: Crosshair, description: "Radar de Search Funds" },
      { title: "Adquisiciones SF", url: "/admin/sf-acquisitions", icon: ShoppingCart, description: "Adquisiciones de Search Funds" },
      { title: "Backers SF", url: "/admin/sf-backers", icon: Users, description: "Backers de Search Funds" },
      { title: "Matching Inbox SF", url: "/admin/sf-matches", icon: Mail, description: "Matching inbox de SF" },
      { title: "Boutiques M&A", url: "/admin/mna-directory", icon: Building2, description: "Competidores y asesores M&A" },
      { title: "Apollo Import M&A", url: "/admin/mna-apollo-import", icon: Upload, description: "Importar boutiques desde Apollo" },
      { title: "Rel. Oportunidades", url: "/admin/oportunidades", icon: Briefcase, description: "Mandatos visibles en ROD" },
    ]
  },

  // ─── 4. CONTENIDO & BLOG ───
  {
    title: "CONTENIDO & BLOG",
    icon: FileText,
    description: "CMS y generación de contenido",
    items: [
      { title: "Content Studio", url: "/admin/content-studio", icon: Sparkles, badge: "AI", description: "Creación de contenido con IA" },
      { title: "Blog & Contenido", url: "/admin/blog-v2", icon: FileText, description: "Posts y artículos" },
      { title: "Casos de Éxito", url: "/admin/case-studies", icon: Award, description: "Casos de clientes" },
      { title: "Noticias M&A", url: "/admin/noticias", icon: Newspaper, description: "Moderar y publicar noticias" },
      { title: "Landing Pages", url: "/admin/landing-pages-unified", icon: LayoutDashboard, description: "Todas las landing pages" },
      { title: "Recursos & Lead Magnets", url: "/admin/lead-magnets", icon: Zap, description: "Recursos descargables" },
      { title: "Agentes IA", url: "/admin/ai-agents", icon: Bot, badge: "AI", description: "Gestión de agentes IA" },
      { title: "Presentaciones", url: "/admin/presentations", icon: Presentation, description: "Presentaciones comerciales" },
    ]
  },

  // ─── 5. MÚLTIPLOS & DATOS ───
  {
    title: "MÚLTIPLOS & DATOS",
    icon: TrendingUp,
    description: "Valoración y datos sectoriales",
    items: [
      { title: "Múltiplos", url: "/admin/multiples", icon: TrendingUp, description: "Datos de valoración" },
      { title: "Múltiplos Asesores", url: "/admin/advisor-multiples", icon: Calculator, description: "Múltiplos para calculadora de asesores" },
      { title: "Intel PE Sectorial", url: "/admin/sector-intelligence", icon: BarChart3, description: "Base de datos PE por subsector (Excel)" },
      { title: "Sectores", url: "/admin/sectors", icon: Tags, description: "Gestión de sectores empresariales" },
      { title: "Sector Dossiers", url: "/admin/sector-dossiers", icon: FolderOpen, badge: "AI", description: "Análisis competitivo por sector con IA" },
    ]
  },

  // ─── 6. MARKETING & OUTBOUND ───
  {
    title: "MARKETING & OUTBOUND",
    icon: Send,
    description: "Campañas y comunicación",
    items: [
      { title: "Newsletter Semanal", url: "/admin/newsletter", icon: Mail, description: "Envío de newsletters a suscriptores" },
      { title: "Costes Campañas", url: "/admin/campaign-costs", icon: DollarSign, description: "Costes de campañas publicitarias" },
      { title: "Importar Brevo", url: "/admin/brevo-import", icon: Users, description: "Importar contactos desde Brevo" },
      { title: "Apollo Visitors", url: "/admin/apollo-visitors", icon: Eye, description: "Importar visitantes desde Apollo" },
      { title: "Dealsuite Sync", url: "/admin/dealsuite", icon: RefreshCw, description: "Sincronizar deals desde Dealsuite" },
    ]
  },

  // ─── 7. GESTIONAR WEB ───
  {
    title: "GESTIONAR WEB",
    icon: Globe,
    description: "Contenido visual del sitio web",
    items: [
      { title: "Equipo", url: "/admin/team", icon: Users, description: "Perfiles del equipo" },
      { title: "Testimonios", url: "/admin/testimonials", icon: MessageSquare, description: "Reseñas de clientes" },
      { title: "Test. Colaboradores", url: "/admin/collaborator-testimonials", icon: MessageSquare, description: "Testimonios de colaboradores" },
      { title: "LP Venta Empresas", url: "/admin/venta-empresas-content", icon: Store, description: "Contenido landing venta empresas" },
      { title: "Logos Carousel", url: "/admin/carousel-logos", icon: Image, description: "Gestión de logos del carrusel" },
      { title: "Banners", url: "/admin/banners", icon: Megaphone, description: "Gestión de banners del sitio" },
      { title: "Hero Slides", url: "/admin/hero-slides", icon: Image, description: "Imágenes y textos del hero principal" },
      { title: "Áreas de Práctica", url: "/admin/practice-areas", icon: Palette, description: "Tarjetas de servicios de la home" },
      { title: "La Firma", url: "/admin/la-firma", icon: Building2, description: "Foto y contenido de la sección La Firma" },
      { title: "Biblioteca de Fotos", url: "/admin/photo-library", icon: Image, description: "Gestiona y organiza fotos" },
    ]
  },

  // ─── 8. CONFIGURACIÓN ───
  {
    title: "CONFIGURACIÓN",
    icon: Cog,
    description: "Configuración del sistema",
    items: [
      { title: "Notificaciones", url: "/admin/notifications", icon: Bell, description: "Centro de notificaciones" },
      { title: "Usuarios Admin", url: "/admin/admin-users", icon: Users, description: "Gestión de administradores" },
      { title: "Workflow Fase 0", url: "/admin/configuracion/workflow-templates", icon: Settings, description: "Configurar tareas del workflow de leads" },
      { title: "Destinatarios Email", url: "/admin/configuracion/destinatarios-email", icon: Target, description: "Gestión de destinatarios de emails" },
      { title: "Firma de Email", url: "/admin/configuracion/firma-email", icon: Mail, description: "Configura tu firma personal para emails outbound" },
      { title: "Data Enrichment", url: "/admin/data-enrichment", icon: Wrench, description: "Enriquecimiento de datos" },
      { title: "Ajustes", url: "/admin/settings", icon: Settings, description: "Configuración general" },
      { title: "Navegación Sidebar", url: "/admin/settings/sidebar", icon: PanelLeft, description: "Configurar secciones e items del menú lateral" },
    ]
  },

  // ─── 9. EMPLEO ───
  {
    title: "EMPLEO",
    icon: BriefcaseBusiness,
    description: "Gestión de empleo y colaboradores",
    items: [
      { title: "Ofertas de Empleo", url: "/admin/jobs", icon: BriefcaseBusiness, description: "Ofertas de trabajo publicadas" },
      { title: "Solicitudes", url: "/admin/job-applications", icon: FileSpreadsheet, description: "Solicitudes recibidas" },
      { title: "Categorías", url: "/admin/job-categories", icon: ListChecks, description: "Categorías de empleo" },
      { title: "Plantillas", url: "/admin/job-templates", icon: LayoutTemplate, description: "Plantillas de ofertas" },
      { title: "Solicitudes Colaboradores", url: "/admin/collaborator-applications", icon: UserCheck, description: "Solicitudes de colaboradores" },
    ]
  },
];
