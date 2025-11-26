import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { compraEmpresasSchema, CompraEmpresasFormData } from '@/schemas/formSchemas';

// Schema is now imported from centralized file

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

// Re-export the type for backward compatibility
export type { CompraEmpresasFormData } from '@/schemas/formSchemas';

export const useCompraEmpresasForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getTrackingData, recordSubmissionAttempt } = useFormSecurity();
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
      const validatedData = compraEmpresasSchema.parse(formData);
      console.log('✅ Acquisition inquiry validation passed');

      // 2. Get tracking data
      const trackingData = await getTrackingData();

      // 3. Insert into company_acquisition_inquiries
      console.log('💾 Inserting acquisition inquiry...');
      const insertData = {
        full_name: validatedData.fullName.trim(),
        company: validatedData.company.trim(),
        email: validatedData.email.trim(),
        phone: validatedData.phone?.trim() || null,
        investment_budget: validatedData.investmentBudget || null,
        sectors_of_interest: validatedData.sectorsOfInterest || null,
        acquisition_type: validatedData.acquisitionType || null,
        target_timeline: validatedData.targetTimeline || null,
        preferred_location: validatedData.preferredLocation || null,
        message: validatedData.message?.trim() || null,
        status: 'new' as const,
        priority: 'high' as const, // Acquisition inquiries are high priority
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_term: trackingData.utm_term,
        utm_content: trackingData.utm_content,
        referrer: trackingData.referrer,
        page_origin: 'compra-empresas',
        user_agent: trackingData.user_agent?.slice(0, 255),
        ip_address: trackingData.ip_address,
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

      // Registrar intento exitoso
      recordSubmissionAttempt(validatedData.email);

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
      
      if (error instanceof Error && error.message.includes('parse')) {
        const fieldErrors = 'Datos de formulario inválidos';
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