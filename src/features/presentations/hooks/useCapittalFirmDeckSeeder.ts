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

// 6-slide Capittal Firm Deck with real corporate data
const CAPITTAL_FIRM_DECK_SLIDES: DemoSlideConfig[] = [
  {
    order_index: 0,
    layout: 'hero',
    headline: 'Maximizamos el valor de tu empresa',
    subline: 'Especialistas en compraventa de empresas',
    content: {
      type: 'firm_hero',
      bullets: [
        'Asesoramiento M&A integral en España',
        'Enfoque orientado a resultados',
        'Equipo multidisciplinar de más de 60 profesionales'
      ],
      logo_url: '/lovable-uploads/capittal-logo.png'
    },
    approval_status: 'approved',
    is_locked: false
  },
  {
    order_index: 1,
    layout: 'bullets',
    headline: 'Nuestros Servicios',
    subline: 'Acompañamos a empresarios y directivos en todo el ciclo de la transacción',
    content: {
      type: 'services',
      bullets: [
        'Valoración de empresas',
        'Venta de empresas (Sell-side)',
        'Compra de empresas (Buy-side)',
        'Due Diligence financiero, fiscal y legal',
        'Planificación fiscal M&A',
        'Reestructuraciones y refinanciaciones'
      ],
      icon: 'briefcase'
    },
    approval_status: 'approved',
    is_locked: false
  },
  {
    order_index: 2,
    layout: 'stats',
    headline: 'Track Record',
    subline: 'Resultados que avalan nuestra experiencia',
    content: {
      type: 'track_record',
      stats: [
        { value: '€902M', label: 'Valor asesorado' },
        { value: '98,7%', label: 'Tasa de éxito' },
        { value: '200+', label: 'Operaciones cerradas' },
        { value: '60+', label: 'Profesionales' }
      ],
      highlight: true
    },
    approval_status: 'approved',
    is_locked: false
  },
  {
    order_index: 3,
    layout: 'bullets',
    headline: 'Nuestra Metodología',
    subline: 'Un proceso estructurado para maximizar el valor',
    content: {
      type: 'methodology',
      bullets: [
        'Análisis exhaustivo y valoración profesional',
        'Preparación de documentación (Teaser, Info Memo)',
        'Marketing confidencial a inversores cualificados',
        'Gestión del proceso competitivo',
        'Due Diligence coordinado',
        'Negociación y cierre'
      ],
      numbered: true
    },
    approval_status: 'approved',
    is_locked: false
  },
  {
    order_index: 4,
    layout: 'timeline',
    headline: 'Proceso de Venta',
    subline: 'Fases del proceso M&A',
    content: {
      type: 'sale_process',
      phases: [
        { number: 1, name: 'Preparación', description: 'Análisis y documentación', weeks: '1-4' },
        { number: 2, name: 'Marketing', description: 'Contacto con inversores', weeks: '5-8' },
        { number: 3, name: 'Ofertas', description: 'Recepción y negociación', weeks: '9-12' },
        { number: 4, name: 'Due Diligence', description: 'Verificación exhaustiva', weeks: '13-16' },
        { number: 5, name: 'Cierre', description: 'Firma y transmisión', weeks: '17-20' }
      ]
    },
    approval_status: 'approved',
    is_locked: false
  },
  {
    order_index: 5,
    layout: 'closing',
    headline: '¿Hablamos?',
    subline: 'Contacta con nosotros para una consulta inicial confidencial',
    content: {
      type: 'contact',
      contact_info: {
        email: 'info@capittal.es',
        phone: '+34 900 XXX XXX',
        website: 'www.capittal.es'
      },
      cta_text: 'Solicitar reunión',
      disclaimer: 'Primera consulta sin compromiso'
    },
    approval_status: 'approved',
    is_locked: true
  }
];

const CAPITTAL_PROJECT_CONFIG = {
  title: 'Capittal - Firm Deck',
  description: 'Presentación corporativa de Capittal M&A Advisory',
  type: 'firm_deck' as const,
  client_name: 'Capittal',
  project_code: 'CAPITTAL-FIRM',
  status: 'draft' as const,
  is_confidential: false,
  metadata: {
    version: 1,
    version_history: [],
    inputs: {
      company_name: 'Capittal',
      sector: 'M&A Advisory',
      transaction_type: 'Corporate Presentation',
      financial_metrics: {
        total_value_advised: 902000000,
        success_rate: 98.7,
        operations_closed: 200,
        team_size: 60
      },
      geography: 'España'
    }
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

      // Create all 6 slides
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
      toast.success('Firm Deck de Capittal creado con 6 slides');
      return project;
    },
    onError: (error: Error) => {
      toast.error('Error al crear Firm Deck: ' + error.message);
    }
  });
};
