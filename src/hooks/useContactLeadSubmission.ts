import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook para envío seguro de contact leads via Edge Function
 * 
 * Características de seguridad:
 * - Honeypot field para detectar bots
 * - Validación server-side
 * - Rate limiting por IP real
 * - Captura de IP real en servidor
 */

export interface ContactLeadData {
  full_name: string;
  email: string;
  company: string;
  service_type?: 'vender' | 'comprar' | 'otros';
  phone?: string;
  sectors_of_interest?: string;
  // Honeypot field (debe estar vacío - solo bots lo llenan)
  website?: string;
}

export const useContactLeadSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLead = async (data: ContactLeadData) => {
    setIsSubmitting(true);

    try {
      // Call secure Edge Function
      const { data: response, error } = await supabase.functions.invoke('submit-contact-lead', {
        body: {
          full_name: data.full_name,
          email: data.email,
          company: data.company,
          service_type: data.service_type,
          phone: data.phone,
          sectors_of_interest: data.sectors_of_interest,
          // Pass honeypot for server-side check
          website: data.website,
        },
      });

      if (error) {
        console.error('Error submitting contact lead:', error);
        toast.error('Error al enviar la solicitud. Inténtalo más tarde.');
        return { success: false };
      }

      // Check for rate limit error
      if (response?.error === 'rate_limit') {
        toast.error(response.message || 'Has alcanzado el límite de solicitudes. Inténtalo más tarde.', {
          duration: 8000,
        });
        return { success: false };
      }

      // Check for validation errors
      if (response?.error) {
        toast.error(response.message || 'Los datos proporcionados no son válidos.');
        return { success: false };
      }

      toast.success('¡Solicitud enviada con éxito! Te contactaremos pronto.');
      return { success: true };

    } catch (error) {
      console.error('Unexpected error submitting contact lead:', error);
      toast.error('Error inesperado. Por favor, inténtalo más tarde.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitLead, isSubmitting };
};
