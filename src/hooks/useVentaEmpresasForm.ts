import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schema
const ventaEmpresasSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(254),
  phone: z.string().trim().min(1, "El teléfono es obligatorio").max(20),
  company: z.string().trim().min(2, "El nombre de empresa debe tener al menos 2 caracteres").max(100),
  revenue: z.string().optional(),
  urgency: z.string().optional(),
});

export type VentaEmpresasFormData = z.infer<typeof ventaEmpresasSchema>;

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

export const useVentaEmpresasForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (formData: VentaEmpresasFormData): Promise<SubmissionResult> => {
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = ventaEmpresasSchema.parse(formData);

      // Collect tracking data
      const urlParams = new URLSearchParams(window.location.search);
      const trackingData = {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        referrer: document.referrer || undefined,
      };

      // Prepare data for insertion
      const insertData = {
        full_name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        company: validatedData.company,
        message: `Facturación: ${formData.revenue || 'No especificado'}\nUrgencia: ${formData.urgency || 'No especificado'}`,
        page_origin: 'lp-venta-empresas',
        source_project: 'lp-venta-empresas',
        source: 'landing',
        status: 'new',
        priority: formData.urgency === 'urgent' ? 'high' : (formData.urgency === 'high' ? 'high' : 'medium'),
        ...trackingData,
      };

      // Insert into general_contact_leads
      const { error: insertError } = await supabase
        .from('general_contact_leads')
        .insert([insertData]);

      if (insertError) {
        console.error('Error inserting contact:', insertError);
        throw new Error('Error al enviar el formulario');
      }

      // Success notification will be handled by the calling component
      setIsSubmitting(false);
      return { success: true };
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Datos de formulario inválidos';
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
