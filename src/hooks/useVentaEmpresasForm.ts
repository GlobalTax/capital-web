import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { ventaEmpresasSchema, VentaEmpresasFormData } from '@/schemas/formSchemas';

// Schema is now imported from centralized file

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

export const useVentaEmpresasForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getTrackingData, recordSubmissionAttempt } = useFormSecurity();

  const submitForm = async (formData: VentaEmpresasFormData): Promise<SubmissionResult> => {
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = ventaEmpresasSchema.parse(formData);

      // Obtener datos de tracking
      const trackingData = await getTrackingData();

      // Map urgency to priority
      const urgencyToPriority: Record<string, string> = {
        urgent: 'high',
        high: 'high',
        medium: 'medium',
        low: 'low',
      };

      // Prepare data for insertion
      const insertData = {
        full_name: validatedData.name.trim(),
        email: validatedData.email.trim(),
        phone: validatedData.phone.trim(),
        company: validatedData.company.trim(),
        message: `Facturación: ${formData.revenue || 'No especificado'}\nUrgencia: ${formData.urgency || 'No especificado'}`,
        page_origin: 'lp-venta-empresas',
        source_project: 'lp-venta-empresas',
        source: 'landing',
        status: 'new',
        priority: urgencyToPriority[formData.urgency || 'medium'] || 'medium',
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
        referrer: trackingData.referrer,
        user_agent: trackingData.user_agent,
        ip_address: trackingData.ip_address,
      };

      // Insert into general_contact_leads
      const { error: insertError } = await supabase
        .from('general_contact_leads')
        .insert([insertData]);

      if (insertError) {
        console.error('Error inserting contact:', insertError);
        throw new Error('Error al enviar el formulario');
      }

      // Registrar intento exitoso
      recordSubmissionAttempt(validatedData.email);

      // Enviar notificaciones por email
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: 'sell_lead',
            formType: 'sell_lead',
            email: validatedData.email,
            fullName: validatedData.name,
            formData: {
              ...validatedData,
              ...trackingData,
              revenue_range: formData.revenue,
              urgency: formData.urgency,
            },
          }
        });
      } catch (notificationError) {
        console.warn('Notification error (non-blocking):', notificationError);
      }

      // Success notification will be handled by the calling component
      setIsSubmitting(false);
      return { success: true };
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      
      if (error instanceof Error && error.message.includes('parse')) {
        const errorMessage = 'Datos de formulario inválidos';
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: 'Error al enviar el formulario. Por favor, intenta de nuevo.' };
    }
  };

  return {
    submitForm,
    isSubmitting,
  };
};
