import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneralContactFormData {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  country: string;
  annualRevenue: string;
  howDidYouHear: string;
  message: string;
}

interface FormSubmissionResult {
  success: boolean;
  error?: string;
  isRateLimited?: boolean;
  remainingRequests?: number;
}

export const useGeneralContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitGeneralContactForm = async (
    formData: GeneralContactFormData,
    pageOrigin: string = 'contacto'
  ): Promise<FormSubmissionResult> => {
    setIsSubmitting(true);

    try {
      // Capture UTM parameters and referrer
      const urlParams = new URLSearchParams(window.location.search);
      
      const submissionData = {
        full_name: formData.fullName,
        company: formData.company,
        phone: formData.phone,
        email: formData.email,
        country: formData.country,
        annual_revenue: formData.annualRevenue,
        how_did_you_hear: formData.howDidYouHear,
        message: formData.message,
        page_origin: pageOrigin,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
        referrer: document.referrer,
        ip_address: null, // This will be set by the database trigger
        user_agent: navigator.userAgent
      };

      const { data, error } = await supabase
        .from('general_contact_leads')
        .insert(submissionData)
        .select()
        .single();

      if (error) {
        console.error('Error submitting general contact form:', error);
        
        // Check for rate limiting
        if (error.message?.includes('rate limit') || error.message?.includes('check_rate_limit_enhanced')) {
          toast({
            title: "Límite de envíos alcanzado",
            description: "Has alcanzado el máximo de envíos permitidos. Por favor, espera antes de intentar de nuevo.",
            variant: "destructive",
          });
          return { success: false, isRateLimited: true };
        }

        toast({
          title: "Error al enviar",
          description: "Ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "¡Mensaje enviado con éxito!",
        description: "Hemos recibido tu consulta. Nos pondremos en contacto contigo en las próximas 24 horas.",
      });

      return { success: true };

    } catch (error: any) {
      console.error('Error in general contact form submission:', error);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitGeneralContactForm,
    isSubmitting
  };
};