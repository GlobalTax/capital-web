import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schema for company acquisition inquiries
const acquisitionInquirySchema = z.object({
  fullName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(100, 'Nombre muy largo'),
  
  company: z.string()
    .min(2, 'Empresa debe tener al menos 2 caracteres')
    .max(100, 'Nombre de empresa muy largo'),
  
  email: z.string()
    .email('Formato de email inválido')
    .min(5, 'Email muy corto')
    .max(254, 'Email muy largo'),
  
  phone: z.string()
    .optional()
    .refine(val => {
      if (!val) return true;
      // Allow formats like +34 695 717 490, 0034 695717490, (34) 695-717-490, 695717490
      const cleaned = val.replace(/[^\d+]/g, '');
      let digits = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
      if (digits.startsWith('0034')) digits = digits.slice(4);
      if (digits.startsWith('34')) digits = digits.slice(2);
      const onlyDigits = digits.replace(/\D/g, '');
      return /^[6-9]\d{8}$/.test(onlyDigits);
    }, {
      message: 'Formato de teléfono español inválido'
    }),
  
  investmentBudget: z.enum(['menos-500k', '500k-1m', '1m-5m', '5m-10m', 'mas-10m']).optional(),
  sectorsOfInterest: z.string().max(500, 'Sectores muy largo').optional(),
  acquisitionType: z.string().max(100, 'Tipo de adquisición muy largo').optional(),
  targetTimeline: z.string().max(100, 'Timeline muy largo').optional(),
  preferredLocation: z.string().max(200, 'Ubicación muy larga').optional(),
  message: z.string().max(1000, 'Mensaje muy largo').optional(),
});

export type CompraEmpresasFormData = z.infer<typeof acquisitionInquirySchema>;

interface SubmissionResult {
  success: boolean;
  error?: string;
}

export const useCompraEmpresasForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitInquiry = async (formData: CompraEmpresasFormData): Promise<SubmissionResult> => {
    if (isSubmitting) {
      console.warn('⚠️ CompraEmpresasForm: Already submitting');
      return { success: false, error: 'Submission in progress' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    console.log('🚀 CompraEmpresasForm: Starting submission', { 
      email: formData.email?.substring(0, 10) + '...'
    });

    try {
      // 1. Validate form data
      console.log('🔍 Validating acquisition inquiry data...');
      const validatedData = acquisitionInquirySchema.parse(formData);
      console.log('✅ Acquisition inquiry validation passed');

      // 2. Get tracking data
      const urlParams = new URLSearchParams(window.location.search);
      const trackingData = {
        utm_source: urlParams.get('utm_source') || null,
        utm_medium: urlParams.get('utm_medium') || null,
        utm_campaign: urlParams.get('utm_campaign') || null,
        utm_term: urlParams.get('utm_term') || null,
        utm_content: urlParams.get('utm_content') || null,
        referrer: document.referrer || null,
        page_origin: 'compra-empresas',
        user_agent: navigator.userAgent,
      };

      // 3. Insert into company_acquisition_inquiries
      console.log('💾 Inserting acquisition inquiry...');
      const insertData = {
        full_name: validatedData.fullName,
        company: validatedData.company,
        email: validatedData.email,
        phone: validatedData.phone || null,
        investment_budget: validatedData.investmentBudget || null,
        sectors_of_interest: validatedData.sectorsOfInterest || null,
        acquisition_type: validatedData.acquisitionType || null,
        target_timeline: validatedData.targetTimeline || null,
        preferred_location: validatedData.preferredLocation || null,
        message: validatedData.message || null,
        status: 'new' as const,
        priority: 'high' as const, // Acquisition inquiries are high priority
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_term: trackingData.utm_term,
        utm_content: trackingData.utm_content,
        referrer: trackingData.referrer,
        page_origin: trackingData.page_origin,
        user_agent: trackingData.user_agent.slice(0, 255),
      };

      const { error } = await supabase
        .from('company_acquisition_inquiries')
        .insert([insertData]);

      if (error) {
        console.error('❌ Acquisition inquiry insert failed:', error.message);
        
        if (error.message?.includes('rate limit')) {
          toast({
            title: "Límite de seguridad",
            description: "Has alcanzado el límite de consultas. Espera antes de intentar de nuevo.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al enviar",
            description: "No se pudo procesar tu consulta de adquisición. Inténtalo de nuevo.",
            variant: "destructive",
          });
        }
        return { success: false, error: error.message };
      }

      console.log('✅ Acquisition inquiry inserted successfully');

      // 4. Send notifications (non-blocking)
      try {
        console.log('📧 Sending acquisition inquiry notifications...');
        const { error: functionError } = await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: 'acquisition_inquiry',
            formType: 'acquisition_inquiry',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: {
              ...validatedData,
              ...trackingData,
              submission_timestamp: new Date().toISOString(),
            },
          }
        });

        if (functionError) {
          console.warn('⚠️ Acquisition notification send failed (non-blocking):', functionError.message);
        } else {
          console.log('✅ Acquisition notifications sent successfully');
        }
      } catch (notificationError) {
        console.warn('⚠️ Acquisition notification error (non-blocking):', notificationError);
      }

      // 5. Success
      const duration = Date.now() - startTime;
      console.log(`🎉 CompraEmpresasForm: Success in ${duration}ms`);
      
      toast({
        title: "¡Consulta enviada!",
        description: "Hemos recibido tu solicitud de adquisición. Te contactaremos en 24h para discutir oportunidades exclusivas.",
        variant: "default",
      });

      return { success: true };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`💥 CompraEmpresasForm: Failed after ${duration}ms:`, error);
      
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => err.message).join(', ');
        console.error('📋 Acquisition validation errors:', fieldErrors);
        toast({
          title: "Datos inválidos",
          description: "Revisa los campos marcados e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else if (error instanceof Error && error.message.includes('network')) {
        toast({
          title: "Error de conexión",
          description: "Verifica tu conexión a internet e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "Ha ocurrido un error. Por favor, inténtalo más tarde.",
          variant: "destructive",
        });
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitInquiry,
    isSubmitting,
  };
};