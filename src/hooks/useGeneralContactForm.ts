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

      console.log('=== GENERAL CONTACT FORM SUBMISSION ===');
      console.log('Submission data being sent:', submissionData);
      console.log('Data validation:', {
        has_full_name: !!submissionData.full_name?.trim(),
        full_name_length: submissionData.full_name?.trim().length || 0,
        has_company: !!submissionData.company?.trim(),
        company_length: submissionData.company?.trim().length || 0,
        has_email: !!submissionData.email?.trim(),
        email_valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submissionData.email || ''),
        has_country: !!submissionData.country?.trim(),
        has_annual_revenue: !!submissionData.annual_revenue?.trim(),
        has_how_did_you_hear: !!submissionData.how_did_you_hear?.trim(),
        has_message: !!submissionData.message?.trim(),
        message_length: submissionData.message?.trim().length || 0,
        message_min_length: submissionData.message?.trim().length >= 10,
        has_page_origin: !!submissionData.page_origin
      });

      // Validate required fields according to RLS policy
      if (!submissionData.message?.trim() || submissionData.message.trim().length < 10) {
        toast({
          title: "Mensaje requerido",
          description: "El mensaje debe tener al menos 10 caracteres.",
          variant: "destructive",
        });
        return { success: false, error: "Message too short" };
      }

      if (!submissionData.page_origin) {
        submissionData.page_origin = 'contacto'; // Ensure page_origin is always set
      }
      
      // PROMPT 5: Use JS client directly instead of REST fetch
      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: formData.fullName,
          company: formData.company,
          phone: formData.phone,
          email: formData.email,
          country: formData.country,
          company_size: formData.annualRevenue,
          referral: formData.howDidYouHear
        }])
        .select()
        .single();

      if (contactError) {
        console.error('Error inserting contact lead:', contactError);
        
        // Check for rate limiting
        if (contactError.message?.includes('rate limit') || contactError.message?.includes('check_rate_limit_enhanced')) {
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
        return { success: false, error: contactError.message };
      }

      // Insert into form_submissions table
      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([{
          form_type: 'contact',
          full_name: formData.fullName,
          email: formData.email,
          form_data: submissionData,
          status: 'new'
        }]);

      // Don't block UX if form_submissions fails, just log it
      if (formError) {
        console.warn('Error inserting form submission (non-blocking):', formError);
      }

      // Send notifications via Edge Function (non-blocking)
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData?.id,
            formType: 'contact',
            email: formData.email,
            fullName: formData.fullName,
            formData: submissionData
          }
        });
      } catch (notificationError) {
        console.warn('Error sending notifications (non-blocking):', notificationError);
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