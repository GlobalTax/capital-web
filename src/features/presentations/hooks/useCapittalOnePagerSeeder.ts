import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database, Json } from '@/integrations/supabase/types';
import { CAPITTAL_LOGO_SVG } from '@/config/brand';

type DbSlideLayout = Database['public']['Tables']['presentation_slides']['Row']['layout'];

interface OnePagerSlideConfig {
  order_index: number;
  layout: DbSlideLayout;
  headline: string;
  subline: string;
  content: Record<string, unknown>;
  approval_status: 'draft' | 'approved' | 'locked' | null;
  is_locked: boolean;
}

/**
 * Capittal One Pager Comercial - 1 slide condensado
 * 
 * Documento comercial de una sola página para enviar a potenciales clientes.
 * Incluye toda la información esencial de Capittal en formato compacto:
 * - Propuesta de valor
 * - Track record
 * - Servicios principales
 * - Diferenciadores
 * - Contacto
 */
const CAPITTAL_ONE_PAGER_SLIDES: OnePagerSlideConfig[] = [
  {
    order_index: 0,
    layout: 'custom',
    headline: 'Capittal | M&A Advisory',
    subline: 'Especialistas exclusivos en compraventa de empresas',
    content: {
      type: 'one_pager_commercial',
      
      // Header section
      header: {
        logo_url: CAPITTAL_LOGO_SVG,
        tagline: 'Maximizamos el valor de tu empresa',
        subtitle: 'Parte del ecosistema Grupo Navarro'
      },
      
      // Track Record - Métricas clave
      track_record: {
        title: 'Track Record',
        stats: [
          { value: '€902M', label: 'Valor asesorado' },
          { value: '98,7%', label: 'Tasa de éxito' },
          { value: '200+', label: 'Operaciones' },
          { value: '25+', label: 'Años de experiencia' }
        ]
      },
      
      // Servicios principales
      services: {
        title: 'Servicios',
        items: [
          { icon: 'building', name: 'Venta de Empresas', description: 'Sell-side M&A' },
          { icon: 'search', name: 'Compra de Empresas', description: 'Buy-side M&A' },
          { icon: 'calculator', name: 'Valoración', description: 'Análisis profesional' },
          { icon: 'shield', name: 'Due Diligence', description: 'Financiero, fiscal y legal' },
          { icon: 'file-text', name: 'Planificación Fiscal', description: 'Optimización M&A' },
          { icon: 'refresh', name: 'Reestructuraciones', description: 'Refinanciaciones' }
        ]
      },
      
      // Diferenciadores
      differentiators: {
        title: 'Por Qué Capittal',
        items: [
          { metric: '+40%', text: 'más valor que la media del mercado' },
          { metric: '6-8 meses', text: 'tiempo de cierre optimizado' },
          { metric: '70+', text: 'profesionales especializados' },
          { metric: '360°', text: 'servicio integral con Navarro Legal' }
        ]
      },
      
      // Proceso resumido
      process: {
        title: 'Proceso',
        phases: [
          { number: 1, name: 'Preparación', weeks: '1-4 sem' },
          { number: 2, name: 'Marketing', weeks: '5-8 sem' },
          { number: 3, name: 'Ofertas', weeks: '9-12 sem' },
          { number: 4, name: 'Due Diligence', weeks: '13-16 sem' },
          { number: 5, name: 'Cierre', weeks: '17-20 sem' }
        ]
      },
      
      // Testimonial destacado
      testimonial: {
        quote: 'Capittal consiguió un precio un 35% superior a nuestra valoración inicial, con un proceso impecable y totalmente confidencial.',
        author: 'CEO',
        company: 'Empresa Industrial',
        sector: 'Sector Manufacturero'
      },
      
      // Contacto
      contact: {
        title: '¿Hablamos?',
        subtitle: 'Primera consulta sin compromiso',
        email: 'info@capittal.es',
        phone: '+34 695 717 490',
        website: 'www.capittal.es',
        linkedin: 'linkedin.com/company/capittal',
        cta: 'Solicitar reunión confidencial'
      },
      
      // Footer
      footer: {
        disclaimer: 'Confidencial - Capittal M&A Advisory © 2024',
        group: 'Grupo Navarro: Capittal + Navarro Legal'
      }
    },
    approval_status: 'approved',
    is_locked: false
  }
];

const CAPITTAL_ONE_PAGER_CONFIG = {
  title: 'Capittal - One Pager Comercial',
  description: 'Documento comercial de una página para enviar a potenciales clientes. Incluye propuesta de valor, track record, servicios, diferenciadores y contacto.',
  type: 'one_pager' as const,
  client_name: 'Capittal',
  project_code: 'CAPITTAL-ONEPAGER-2024',
  status: 'draft' as const,
  is_confidential: false,
  metadata: {
    version: 1,
    purpose: 'commercial_outreach',
    target_audience: 'potential_clients',
    format: 'single_page',
    inputs: {
      company_name: 'Capittal',
      sector: 'M&A Advisory',
      financial_metrics: {
        total_value_advised: 902000000,
        success_rate: 98.7,
        operations_closed: 200,
        team_size: 70,
        years_experience: 25,
        avg_value_increase_percent: 40,
        avg_process_months: 7
      },
      geography: 'España',
      group: 'Grupo Navarro'
    },
    tags: ['one_pager', 'commercial', 'capittal', 'outreach', 'sales'],
    language: 'es'
  }
};

export const useCapittalOnePagerSeeder = () => {
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
          ...CAPITTAL_ONE_PAGER_CONFIG,
          brand_kit_id: defaultKit?.id || null,
          theme: 'light'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create the single One Pager slide
      const slidesToInsert = CAPITTAL_ONE_PAGER_SLIDES.map(slide => ({
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
      toast.success('One Pager comercial de Capittal creado');
      return project;
    },
    onError: (error: Error) => {
      toast.error('Error al crear One Pager: ' + error.message);
    }
  });
};
