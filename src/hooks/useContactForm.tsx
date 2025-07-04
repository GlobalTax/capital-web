import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  fullName: string;
  company: string;
  phone?: string;
  email: string;
  country?: string;
  companySize?: string;
  referral?: string;
}

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitContactForm = async (formData: ContactFormData) => {
    console.log('📝 [ContactForm] Iniciando envío de formulario:', formData);
    setIsSubmitting(true);
    
    try {
      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      // Insertar directamente en contact_leads para mantener compatibilidad
      const { data, error } = await supabase
        .from('contact_leads')
        .insert({
          full_name: formData.fullName,
          company: formData.company,
          phone: formData.phone,
          email: formData.email,
          country: formData.country,
          company_size: formData.companySize,
          referral: formData.referral,
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [ContactForm] Error insertando en Supabase:', error);
        throw error;
      }
      
      console.log('✅ [ContactForm] Formulario enviado exitosamente:', data.id);

      toast({
        title: "Solicitud enviada",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.",
      });

      return data;
    } catch (error) {
      console.error('❌ [ContactForm] Error enviando formulario:', error);
      
      toast({
        title: "Error",
        description: "Hubo un problema enviando tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContactForm,
    isSubmitting,
  };
};