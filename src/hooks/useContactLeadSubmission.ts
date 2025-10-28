import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook para envío seguro de contact leads con protección anti-spam
 * 
 * Características de seguridad:
 * - Honeypot field para detectar bots
 * - Validación local antes de enviar a DB
 * - Rate limiting: 2 leads/día por IP
 * - Mensajes amigables de error
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
      // HONEYPOT CHECK: Campo invisible que solo los bots llenan
      // Si está lleno, simulamos éxito pero no guardamos (engañar al bot)
      if (data.website && data.website.trim() !== '') {
        console.log('🍯 Honeypot triggered - bot detected');
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Solicitud enviada correctamente');
        return { success: true };
      }

      // Validación adicional de seguridad (anti-spam)
      const emailLower = data.email.toLowerCase();
      const nameLower = data.full_name.toLowerCase();
      const companyLower = data.company.toLowerCase();

      if (
        emailLower.includes('test') ||
        emailLower.includes('fake') ||
        emailLower.includes('spam') ||
        nameLower.includes('test') ||
        companyLower.includes('test')
      ) {
        toast.error('Por favor, usa datos reales para contactarnos');
        return { success: false };
      }

      // Insertar lead con tracking automático
      const { error } = await supabase
        .from('contact_leads')
        .insert({
          full_name: data.full_name.trim(),
          email: data.email.trim().toLowerCase(),
          company: data.company.trim(),
          service_type: data.service_type,
          phone: data.phone?.trim(),
          sectors_of_interest: data.sectors_of_interest?.trim(),
          // Estos campos los captura automáticamente Supabase con RLS
          ip_address: null,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        });

      if (error) {
        console.error('Error submitting contact lead:', error);

        // Manejo específico de rate limit
        if (error.message.includes('rate_limit') || error.message.includes('rate limit')) {
          toast.error('Has alcanzado el límite de solicitudes (2 por día). Inténtalo mañana o contáctanos directamente.', {
            duration: 8000,
          });
          return { success: false };
        }

        // Otros errores de validación RLS
        if (error.message.includes('policy') || error.message.includes('violates')) {
          toast.error('Los datos proporcionados no son válidos. Verifica tu información.');
          return { success: false };
        }
        
        toast.error('Error al enviar la solicitud. Inténtalo más tarde.');
        return { success: false };
      }

      toast.success('¡Solicitud enviada con éxito! Te contactaremos pronto.');
      return { success: true };

    } catch (error) {
      console.error('Unexpected error submitting contact lead:', error);
      toast.error('Error inesperado. Por favor, inténtalo más tarde o contáctanos directamente.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitLead, isSubmitting };
};
