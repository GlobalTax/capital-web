import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database, Json } from '@/integrations/supabase/types';

type DbSlideLayout = Database['public']['Tables']['presentation_slides']['Row']['layout'];

interface DemoSlideConfig {
  order_index: number;
  layout: DbSlideLayout;
  headline: string;
  subline: string;
  content: Record<string, unknown>;
  approval_status: 'draft' | 'approved' | 'locked' | null;
  is_locked: boolean;
}

// 8-slide TEASER_SELL structure with realistic M&A content
const DEMO_SLIDES: DemoSlideConfig[] = [
  {
    order_index: 0,
    layout: 'disclaimer',
    headline: 'Proyecto Acero',
    subline: 'Teaser Confidencial',
    content: {
      type: 'disclaimer',
      confidential: true,
      watermark: 'CONFIDENCIAL',
      disclaimer_text: 'Este documento es estrictamente confidencial y está destinado únicamente a los destinatarios autorizados.',
      legal_notice: 'La información contenida en este documento no constituye una oferta de venta ni una solicitud de oferta de compra.'
    },
    approval_status: 'approved',
    is_locked: true
  },
  {
    order_index: 1,
    layout: 'hero',
    headline: 'Investment Highlights',
    subline: 'Oportunidad de inversión única en el sector industrial',
    content: {
      type: 'investment_highlights',
      bullets: [
        'Líder regional con 25 años de trayectoria consolidada',
        'EBITDA de €2.25M con margen sostenido del 18%',
        'Base de clientes diversificada con +150 cuentas activas',
        'Equipo directivo comprometido con la transición'
      ]
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 2,
    layout: 'overview',
    headline: 'Company Overview',
    subline: 'Grupo Metalúrgico Acero S.L.',
    content: {
      type: 'company_overview',
      founded: 1999,
      headquarters: 'Valencia, España',
      employees: 85,
      description: 'Empresa líder en fabricación de componentes metálicos de alta precisión para los sectores de automoción e industria pesada.',
      key_facts: [
        'Fundada en 1999',
        'Sede central en Valencia',
        '85 empleados cualificados',
        'Certificaciones ISO 9001 y IATF 16949'
      ]
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 3,
    layout: 'bullets',
    headline: 'Business Model',
    subline: 'Modelo operativo vertical e integrado',
    content: {
      type: 'business_model',
      bullets: [
        'Fabricación integrada: corte, mecanizado, soldadura y acabados',
        'Contratos recurrentes con OEMs de primer nivel (60% de ingresos)',
        'Inversión continua en automatización (€1.5M últimos 3 años)',
        'Cadena de suministro optimizada con proveedores locales'
      ],
      revenue_streams: [
        { name: 'Componentes automoción', percentage: 45 },
        { name: 'Maquinaria industrial', percentage: 35 },
        { name: 'Proyectos especiales', percentage: 20 }
      ]
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 4,
    layout: 'market',
    headline: 'Market & Positioning',
    subline: 'Sector industrial en crecimiento sostenido',
    content: {
      type: 'market_positioning',
      market_size: '€4.2B mercado español de componentes metálicos',
      growth_rate: '4.5% CAGR 2020-2025',
      competitive_advantages: [
        'Proximidad a clusters industriales clave',
        'Certificaciones exigidas por OEMs',
        'Capacidad de prototipado rápido',
        'Flexibilidad para series cortas y largas'
      ],
      market_position: 'Top 5 regional en componentes de precisión'
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 5,
    layout: 'financials',
    headline: 'Financial Snapshot',
    subline: 'Métricas financieras auditadas 2024',
    content: {
      type: 'financial_metrics',
      currency: 'EUR',
      period: '2024',
      metrics: {
        revenue: 12500000,
        ebitda: 2250000,
        ebitda_margin: 18,
        net_income: 1450000,
        net_margin: 11.6
      },
      growth: {
        revenue_yoy: 8.5,
        ebitda_yoy: 12.3
      },
      debt_free: false,
      net_debt: 850000
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 6,
    layout: 'bullets',
    headline: 'Growth & Value Creation',
    subline: 'Palancas de crecimiento identificadas',
    content: {
      type: 'growth_drivers',
      bullets: [
        'Expansión geográfica a mercados adyacentes (Portugal, Sur de Francia)',
        'Desarrollo de línea de productos propios de alto margen',
        'Digitalización de procesos productivos (Industria 4.0)',
        'Adquisiciones bolt-on de talleres especializados'
      ],
      synergy_potential: 'Potencial de sinergias operativas con plataformas industriales'
    },
    approval_status: 'draft',
    is_locked: false
  },
  {
    order_index: 7,
    layout: 'closing',
    headline: 'Transaction & Next Steps',
    subline: 'Proceso de venta estructurado',
    content: {
      type: 'transaction_process',
      transaction_type: 'Venta del 100% de las participaciones',
      timeline: [
        { phase: 'Fase 1: NDA y Teaser', weeks: '1-2' },
        { phase: 'Fase 2: Info Pack y ofertas indicativas', weeks: '3-6' },
        { phase: 'Fase 3: Due Diligence', weeks: '7-12' },
        { phase: 'Fase 4: Ofertas vinculantes y cierre', weeks: '13-16' }
      ],
      contact: {
        advisor: 'Capittal M&A Advisory',
        email: 'deals@capittal.es'
      }
    },
    approval_status: 'approved',
    is_locked: true
  }
];

const DEMO_PROJECT_CONFIG = {
  title: 'Proyecto Acero - Teaser Confidencial',
  description: 'Teaser de venta para operación sell-side de empresa industrial',
  type: 'teaser_sell' as const,
  client_name: 'Grupo Metalúrgico Acero S.L.',
  project_code: 'Proyecto Acero',
  status: 'draft' as const,
  is_confidential: true,
  metadata: {
    version: 1,
    version_history: [],
    inputs: {
      company_name: 'Proyecto Acero',
      sector: 'Industrial - Fabricación Metálica',
      transaction_type: 'M&A Sell-side',
      financial_metrics: {
        revenue: 12500000,
        ebitda: 2250000,
        ebitda_margin: 18,
        growth_rate: 8.5
      },
      geography: 'España - Levante',
      employees: 85
    }
  }
};

export const useDemoPresentationSeeder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Get default brand kit
      const { data: defaultKit } = await supabase
        .from('brand_kits')
        .select('id')
        .eq('is_default', true)
        .maybeSingle();

      // Create the presentation project
      const { data: project, error: projectError } = await supabase
        .from('presentation_projects')
        .insert({
          ...DEMO_PROJECT_CONFIG,
          brand_kit_id: defaultKit?.id || null,
          theme: 'light'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create all 8 slides with mixed approval statuses
      const slidesToInsert = DEMO_SLIDES.map(slide => ({
        project_id: project.id,
        order_index: slide.order_index,
        layout: slide.layout,
        headline: slide.headline,
        subline: slide.subline,
        content: slide.content as Json,
        approval_status: slide.approval_status,
        is_locked: slide.is_locked,
        approved_at: slide.approval_status === 'approved' ? new Date().toISOString() : null,
        is_hidden: false
      }));

      const { error: slidesError } = await supabase
        .from('presentation_slides')
        .insert(slidesToInsert);

      if (slidesError) throw slidesError;

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['presentations'] });
      toast.success('Demo presentation "Proyecto Acero" created with 8 slides (2 approved, 6 drafts)');
      return project;
    },
    onError: (error: Error) => {
      toast.error('Failed to create demo presentation: ' + error.message);
    }
  });
};
