// =============================================
// CORPORATE EMAIL HOOK
// Manages email sending to corporate buyer contacts
// =============================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface SendEmailParams {
  contactIds?: string[];
  buyerIds?: string[];
  subject: string;
  body: string;
  mode: 'template' | 'custom' | 'ai_generated';
  operationId?: string;
  includeTeaser?: boolean;
}

export interface GenerateEmailParams {
  buyerId: string;
  contactId?: string;
  operationId?: string;
  tone?: 'formal' | 'professional' | 'friendly';
  purpose?: 'introduction' | 'opportunity' | 'followup';
  customContext?: string;
}

export interface SendEmailResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  details?: { email: string; name: string; buyer: string }[];
  errors?: string[];
}

export interface GenerateEmailResult {
  success: boolean;
  subject: string;
  body: string;
  buyer_name: string;
  contact_name: string | null;
  operation_name: string | null;
}

// Hook for sending emails
export function useSendCorporateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendEmailParams): Promise<SendEmailResult> => {
      const { data, error } = await supabase.functions.invoke('send-corporate-email', {
        body: {
          contact_ids: params.contactIds,
          buyer_ids: params.buyerIds,
          subject: params.subject,
          body: params.body,
          mode: params.mode,
          operation_id: params.operationId,
          include_teaser: params.includeTeaser,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-outreach'] });
      if (data.sent > 0) {
        toast.success(`${data.sent} email${data.sent > 1 ? 's' : ''} enviado${data.sent > 1 ? 's' : ''} correctamente`);
      }
      if (data.failed > 0) {
        toast.warning(`${data.failed} email${data.failed > 1 ? 's' : ''} fallido${data.failed > 1 ? 's' : ''}`);
      }
    },
    onError: (error) => {
      console.error('Error sending email:', error);
      toast.error('Error al enviar el email');
    },
  });
}

// Hook for generating email content with AI
export function useGenerateCorporateEmail() {
  return useMutation({
    mutationFn: async (params: GenerateEmailParams): Promise<GenerateEmailResult> => {
      const { data, error } = await supabase.functions.invoke('generate-corporate-email', {
        body: {
          buyer_id: params.buyerId,
          contact_id: params.contactId,
          operation_id: params.operationId,
          tone: params.tone,
          purpose: params.purpose,
          custom_context: params.customContext,
        },
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Error generating email:', error);
      toast.error('Error al generar el email con IA');
    },
  });
}

// Hook for fetching available operations for templates
export function useActiveOperations() {
  return useQuery({
    queryKey: ['active-operations-for-email'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_operations')
        .select('id, company_name, sector, description, valuation_amount')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}

// Hook for fetching contacts for a buyer
export function useBuyerContactsForEmail(buyerId: string | undefined) {
  return useQuery({
    queryKey: ['buyer-contacts-email', buyerId],
    queryFn: async () => {
      if (!buyerId) return [];
      
      const { data, error } = await supabase
        .from('corporate_contacts')
        .select('id, full_name, email, title, role, is_primary_contact')
        .eq('buyer_id', buyerId)
        .eq('is_deleted', false)
        .not('email', 'is', null)
        .order('is_primary_contact', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!buyerId,
  });
}

// Email templates
export const EMAIL_TEMPLATES = {
  introduction: {
    subject: 'Explorar sinergias - {{buyer_name}}',
    body: `Estimado/a {{name}},

Me pongo en contacto desde Capittal, boutique de M&A especializada en el middle-market español.

Hemos identificado a {{buyer_name}} como un player relevante en vuestro sector y nos gustaría explorar posibles sinergias en relación a oportunidades de inversión que estamos gestionando.

¿Tendríais disponibilidad para una breve llamada de 15 minutos esta semana o la próxima?

Quedo a la espera de vuestra respuesta.

Un saludo,

Samuel Navarro
Managing Partner
Capittal · M&A Advisory
+34 695 717 490`,
  },
  opportunity: {
    subject: 'Oportunidad de inversión - {{operation_name}}',
    body: `Estimado/a {{name}},

Desde Capittal, boutique de M&A, nos ponemos en contacto para presentarles una oportunidad de inversión que encaja con el perfil de {{buyer_name}}.

Se trata de {{operation_name}}, una compañía del sector {{operation_sector}} que busca un socio estratégico para su próxima fase de crecimiento.

{{operation_description}}

Adjuntamos el teaser con más información. ¿Les interesaría recibir más detalles o agendar una llamada para comentarlo?

Quedamos a su disposición.

Un saludo,

Samuel Navarro
Managing Partner
Capittal · M&A Advisory
+34 695 717 490`,
  },
  followup: {
    subject: 'Seguimiento - {{buyer_name}}',
    body: `Estimado/a {{name}},

Espero que os encontréis bien. Me pongo en contacto para dar seguimiento a nuestra última conversación.

¿Habéis tenido oportunidad de revisar la información que os enviamos? Quedamos a vuestra disposición para cualquier duda o para ampliar información sobre las oportunidades que os comentamos.

Igualmente, si hay algún criterio de inversión específico que queráis compartir, estaremos encantados de tenerlo en cuenta para futuras operaciones.

Un saludo,

Samuel Navarro
Managing Partner
Capittal · M&A Advisory
+34 695 717 490`,
  },
} as const;

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
