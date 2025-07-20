
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  validateEmail, 
  validateCompanyName, 
  validateContactName, 
  validateSpanishPhone,
  sanitizeAndValidateText 
} from '@/utils/validationUtils';
import { sanitizeObject } from '@/utils/sanitization';

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
      // Sanitizar todos los campos antes de validar
      const sanitizedData = sanitizeObject(formData, {
        fullName: 'STRICT',
        company: 'STRICT',
        phone: 'STRICT',
        email: 'STRICT',
        country: 'STRICT',
        companySize: 'STRICT',
        referral: 'STRICT'
      });

      // Validaciones específicas con sanitización
      const nameValidation = validateContactName(sanitizedData.fullName);
      if (!nameValidation.isValid) {
        toast({
          title: "Error de validación",
          description: nameValidation.message,
          variant: "destructive",
        });
        return;
      }

      const companyValidation = validateCompanyName(sanitizedData.company);
      if (!companyValidation.isValid) {
        toast({
          title: "Error de validación",
          description: companyValidation.message,
          variant: "destructive",
        });
        return;
      }

      const emailValidation = validateEmail(sanitizedData.email);
      if (!emailValidation.isValid) {
        toast({
          title: "Error de validación",
          description: emailValidation.message,
          variant: "destructive",
        });
        return;
      }

      // Validar teléfono si se proporciona
      if (sanitizedData.phone) {
        const phoneValidation = validateSpanishPhone(sanitizedData.phone);
        if (!phoneValidation.isValid) {
          toast({
            title: "Error de validación",
            description: phoneValidation.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Usar valores sanitizados para el envío
      const finalData = {
        full_name: nameValidation.sanitizedValue || sanitizedData.fullName,
        company: companyValidation.sanitizedValue || sanitizedData.company,
        phone: sanitizedData.phone ? (validateSpanishPhone(sanitizedData.phone).sanitizedValue || sanitizedData.phone) : undefined,
        email: emailValidation.sanitizedValue || sanitizedData.email,
        country: sanitizedData.country,
        company_size: sanitizedData.companySize,
        referral: sanitizedData.referral,
      };

      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      // Insertar directamente en contact_leads para mantener compatibilidad
      const { data, error } = await supabase
        .from('contact_leads')
        .insert({
          ...finalData,
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
