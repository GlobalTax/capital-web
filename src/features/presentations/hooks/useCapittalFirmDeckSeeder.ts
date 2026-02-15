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

/**
 * Capittal Firm Deck - 8 slides con contenido real corporativo
 * 
 * Datos extraídos de la web oficial de Capittal:
 * - €902M valor total asesorado
 * - 98,7% tasa de éxito
 * - 200+ operaciones cerradas
 * - 70+ profesionales especializados
 * - 25+ años de experiencia exclusiva en M&A
 * - Proceso optimizado de 6-8 meses
 * - +40% más valor que la media del mercado
 * - Grupo Navarro: Capittal + Navarro Legal (servicio 360°)
 */
const CAPITTAL_FIRM_DECK_SLIDES: DemoSlideConfig[] = [
  // Slide 1: Hero - Posicionamiento
  {
    order_index: 0,
    layout: 'hero',
    headline: 'Maximizamos el valor de tu empresa',
    subline: 'Especialistas exclusivos en M&A desde hace más de 25 años',
    content: {
      type: 'firm_hero',
      bullets: [
        'Asesoramiento M&A integral en España',
        'Parte del ecosistema Grupo Navarro',
        'Más de 70 profesionales especializados'
      ],
      logo_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo.svg',
      tagline: 'M&A Advisory'
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 2: Stats - Track Record
  {
    order_index: 1,
    layout: 'stats',
    headline: 'Track Record',
    subline: 'Resultados que avalan más de 25 años de experiencia',
    content: {
      type: 'track_record',
      stats: [
        { value: '€902M', label: 'Valor asesorado', suffix: '' },
        { value: '98,7%', label: 'Tasa de éxito', suffix: '' },
        { value: '200+', label: 'Operaciones cerradas', suffix: '' },
        { value: '70+', label: 'Profesionales', suffix: '' }
      ],
      highlight: true,
      source: 'Datos acumulados históricos'
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 3: Bullets - Servicios
  {
    order_index: 2,
    layout: 'bullets',
    headline: 'Nuestros Servicios',
    subline: 'Acompañamos a empresarios en todo el ciclo de la transacción',
    content: {
      type: 'services',
      bullets: [
        'Valoración de empresas',
        'Venta de empresas (Sell-side)',
        'Compra de empresas (Buy-side)',
        'Due Diligence integral (financiero, fiscal, legal)',
        'Planificación fiscal M&A',
        'Reestructuraciones y refinanciaciones'
      ],
      icon: 'briefcase'
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 4: Comparison - Diferenciadores
  {
    order_index: 3,
    layout: 'comparison',
    headline: 'Lo Que Nos Diferencia',
    subline: 'No somos una consultora generalista',
    content: {
      type: 'differentiators',
      options: [
        {
          metric: 'Solo M&A',
          title: 'Especialización Exclusiva',
          description: '+25 años dedicados exclusivamente a M&A'
        },
        {
          metric: '+40% valor',
          title: 'Resultados Medibles',
          description: 'Valoraciones superiores a la media del mercado'
        },
        {
          metric: '6-8 meses',
          title: 'Proceso Optimizado',
          description: 'Tiempos reducidos sin comprometer calidad'
        },
        {
          metric: '70+ expertos',
          title: 'Ecosistema Integral',
          description: 'Abogados, fiscales, laborales y economistas'
        },
        {
          metric: 'Servicio 360°',
          title: 'Grupo Navarro',
          description: 'Capittal + Navarro Legal integrados'
        }
      ],
      highlight_index: 1
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 5: Bullets - Nuestro Enfoque
  {
    order_index: 4,
    layout: 'bullets',
    headline: 'Nuestro Enfoque',
    subline: 'Un método probado que combina experiencia con servicio personalizado',
    content: {
      type: 'approach',
      bullets: [
        'Enfoque Personalizado: Estrategia adaptada a tu negocio y objetivos',
        'Confidencialidad Total: Protocolos estrictos de protección de información',
        'Eficiencia Temporal: Procesos optimizados sin comprometer la calidad',
        'Maximización de Valor: Objetivo de conseguir el mejor precio y términos'
      ],
      icon: 'target',
      numbered: false
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 6: Timeline - Proceso de Venta
  {
    order_index: 5,
    layout: 'timeline',
    headline: 'Proceso de Venta',
    subline: 'Fases del proceso M&A típico (6-8 meses)',
    content: {
      type: 'sale_process',
      phases: [
        { number: 1, name: 'Preparación', description: 'Análisis y documentación', weeks: '1-4 sem' },
        { number: 2, name: 'Marketing', description: 'Contacto con inversores', weeks: '5-8 sem' },
        { number: 3, name: 'Ofertas', description: 'Recepción y negociación', weeks: '9-12 sem' },
        { number: 4, name: 'Due Diligence', description: 'Verificación exhaustiva', weeks: '13-16 sem' },
        { number: 5, name: 'Cierre', description: 'Firma y transmisión', weeks: '17-20 sem' }
      ],
      total_duration: '6-8 meses',
      note: 'Tiempos orientativos que pueden variar según complejidad'
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 7: Overview - Grupo Navarro
  {
    order_index: 6,
    layout: 'overview',
    headline: 'Ecosistema Grupo Navarro',
    subline: 'Servicio integral desde la valoración hasta el cierre legal',
    content: {
      type: 'group_overview',
      entities: [
        {
          name: 'Capittal',
          role: 'M&A Advisory',
          description: 'Asesoramiento especializado en compraventa de empresas'
        },
        {
          name: 'Navarro Legal',
          role: 'Asesoramiento Jurídico',
          description: 'Cobertura legal integral para transacciones corporativas'
        }
      ],
      benefits: [
        '+15-25% incremento en precio final',
        'Un solo equipo coordinado',
        'Menor riesgo por identificación temprana de contingencias',
        'Eficiencia en costes y tiempos'
      ],
      tagline: 'Servicio 360° para operaciones de M&A'
    },
    approval_status: 'approved',
    is_locked: false
  },
  
  // Slide 8: Closing - Contacto
  {
    order_index: 7,
    layout: 'closing',
    headline: '¿Hablamos?',
    subline: 'Contacta con nosotros para una consulta inicial confidencial',
    content: {
      type: 'contact',
      contact_info: {
        email: 'info@capittal.es',
        website: 'www.capittal.es',
        linkedin: 'linkedin.com/company/capittal'
      },
      cta_text: 'Solicitar reunión',
      cta_url: 'https://capittal.es/contacto',
      disclaimer: 'Primera consulta sin compromiso',
      logo_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/public-assets/logotipo.svg'
    },
    approval_status: 'approved',
    is_locked: true
  }
];

const CAPITTAL_PROJECT_CONFIG = {
  title: 'Capittal - Firm Deck Corporativo',
  description: 'Presentación corporativa oficial de Capittal M&A Advisory. Incluye track record, servicios, diferenciadores, proceso de venta e integración con Grupo Navarro.',
  type: 'firm_deck' as const,
  client_name: 'Capittal',
  project_code: 'CAPITTAL-FIRM-2024',
  status: 'draft' as const,
  is_confidential: false,
  metadata: {
    version: 2,
    version_history: [
      { version: 1, date: '2024-01-01', notes: 'Versión inicial con 6 slides' },
      { version: 2, date: '2024-12-01', notes: 'Ampliación a 8 slides con contenido real enriquecido' }
    ],
    inputs: {
      company_name: 'Capittal',
      sector: 'M&A Advisory',
      transaction_type: 'Corporate Presentation',
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
      group: 'Grupo Navarro',
      subsidiaries: ['Capittal', 'Navarro Legal']
    },
    tags: ['firm_deck', 'corporate', 'capittal', 'ma_advisory', 'grupo_navarro'],
    language: 'es'
  }
};

export const useCapittalFirmDeckSeeder = () => {
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
          ...CAPITTAL_PROJECT_CONFIG,
          brand_kit_id: defaultKit?.id || null,
          theme: 'light'
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create all 8 slides
      const slidesToInsert = CAPITTAL_FIRM_DECK_SLIDES.map(slide => ({
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
      toast.success('Firm Deck de Capittal creado con 8 slides');
      return project;
    },
    onError: (error: Error) => {
      toast.error('Error al crear Firm Deck: ' + error.message);
    }
  });
};
