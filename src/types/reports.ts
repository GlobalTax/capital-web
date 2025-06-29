
export interface ReportConfig {
  id?: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  template: string;
  metrics: string[];
  schedule: string; // cron expression
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface GeneratedReport {
  id: string;
  config_id?: string;
  report_data: any;
  pdf_url?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  error_message?: string;
  generated_at: string;
  sent_at?: string;
  recipients_sent?: string[];
}

export interface ReportData {
  businessMetrics: {
    totalRevenue: number;
    totalDeals: number;
    avgDealSize: number;
    conversionRate: number;
  };
  contentMetrics: {
    totalViews: number;
    totalEngagement: number;
    topPosts: Array<{
      title: string;
      views: number;
      engagement: number;
    }>;
  };
  systemMetrics: {
    uptime: number;
    responseTime: number;
    activeUsers: number;
  };
  leads: {
    total: number;
    new: number;
    converted: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  supportedMetrics: string[];
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Resumen Ejecutivo',
    description: 'Reporte completo con métricas clave de negocio',
    supportedMetrics: ['business', 'content', 'leads', 'system']
  },
  {
    id: 'business-performance',
    name: 'Rendimiento Comercial',
    description: 'Enfocado en métricas de ventas y conversión',
    supportedMetrics: ['business', 'leads']
  },
  {
    id: 'content-analytics',
    name: 'Análisis de Contenido',
    description: 'Métricas de blog y engagement',
    supportedMetrics: ['content']
  },
  {
    id: 'system-health',
    name: 'Estado del Sistema',
    description: 'Métricas técnicas y de rendimiento',
    supportedMetrics: ['system']
  }
];

export const METRIC_TYPES = [
  { id: 'business', label: 'Métricas Comerciales', description: 'Revenue, deals, conversión' },
  { id: 'content', label: 'Análisis de Contenido', description: 'Blog, engagement, views' },
  { id: 'leads', label: 'Generación de Leads', description: 'Leads, conversiones, pipeline' },
  { id: 'system', label: 'Métricas del Sistema', description: 'Uptime, performance, usuarios' }
];
