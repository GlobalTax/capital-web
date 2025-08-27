
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRateLimit } from '@/hooks/useRateLimit';
import { 
  validateEmail, 
  validateCompanyName, 
  validateContactName, 
  validateSpanishPhone,
  sanitizeAndValidateText 
} from '@/utils/validationUtils';
import { sanitizeObject } from '@/utils/sanitization';
import { logger } from '@/utils/logger';

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
  
  // Rate limiting: 5 intentos por 10 minutos para formulario de contacto
  const rateLimit = useRateLimit({
    maxRequests: 5,
    windowMs: 10 * 60 * 1000, // 10 minutos
    blockDurationMs: 10 * 60 * 1000 // bloquear por 10 minutos
  });

  const submitContactForm = async (formData: ContactFormData) => {
    logger.info('📝 [ContactForm] Iniciando envío de formulario', { formData: { ...formData, email: '[REDACTED]' } }, { context: 'form', component: 'useContactForm' });
    
    // Verificar rate limiting antes de procesar
    if (rateLimit.isRateLimited('contact-form')) {
      logger.warn('⚠️ [ContactForm] Rate limit excedido', { 
        remainingRequests: rateLimit.getRemainingRequests('contact-form')
      }, { context: 'security', component: 'useContactForm' });
      
      toast({
        title: "Demasiados intentos",
        description: "Has excedido el límite de envíos. Por favor espera unos minutos antes de intentar de nuevo.",
        variant: "destructive",
      });
      return { isRateLimited: true, remainingRequests: rateLimit.getRemainingRequests('contact-form') };
    }
    
    setIsSubmitting(true);
    
    try {
      // Usar executeWithRateLimit para envolver la operación completa
      const result = await rateLimit.executeWithRateLimit(async () => {
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

        // Validaciones individuales
        validateContactName(sanitizedData.fullName);
        validateCompanyName(sanitizedData.company);
        validateEmail(sanitizedData.email);
        
        if (sanitizedData.phone) {
          validateSpanishPhone(sanitizedData.phone);
        }

        // Get UTM and referrer data
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source') || undefined;
        const utm_medium = urlParams.get('utm_medium') || undefined;
        const utm_campaign = urlParams.get('utm_campaign') || undefined;
        const referrer = document.referrer || undefined;
        
        // Insert into contact_leads table
        const { data: leadData, error: leadError } = await supabase
          .from('contact_leads')
          .insert([{
            full_name: sanitizedData.fullName,
            company: sanitizedData.company,
            phone: sanitizedData.phone,
            email: sanitizedData.email,
            country: sanitizedData.country,
            company_size: sanitizedData.companySize,
            referral: sanitizedData.referral,
            utm_source,
            utm_medium,
            utm_campaign,
            referrer,
            status: 'new'
          }])
          .select()
          .single();

        if (leadError) {
          logger.error('❌ [ContactForm] Error insertando en contact_leads', leadError, { context: 'database', component: 'useContactForm' });
          throw leadError;
        }

        // Insert into unified form_submissions table
        const { data: submissionData, error: submissionError } = await supabase
          .from('form_submissions')
          .insert([{
            form_type: 'contact_form',
            form_data: sanitizedData,
            metadata: {
              utm_source,
              utm_medium,
              utm_campaign,
              referrer,
              user_agent: navigator.userAgent,
              timestamp: new Date().toISOString()
            },
            status: 'new',
            reference_id: leadData.id
          }])
          .select()
          .single();

        if (submissionError) {
          logger.error('❌ [ContactForm] Error insertando en form_submissions', submissionError, { context: 'database', component: 'useContactForm' });
          // No lanzar error aquí ya que el lead principal se guardó correctamente
        }

        logger.info('✅ [ContactForm] Formulario enviado correctamente', { 
          leadId: leadData.id,
          submissionId: submissionData?.id
        }, { context: 'form', component: 'useContactForm' });

        return leadData;
      }, 'contact-form');

      if (result === null) {
        // Rate limit fue aplicado dentro del executeWithRateLimit
        return { 
          isRateLimited: true, 
          remainingRequests: rateLimit.getRemainingRequests('contact-form')
        };
      }

      toast({
        title: "Solicitud enviada",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.",
      });

      return { 
        data: result, 
        isRateLimited: false, 
        remainingRequests: rateLimit.getRemainingRequests('contact-form')
      };
      
    } catch (error) {
      logger.error('❌ [ContactForm] Error enviando formulario', error as Error, { context: 'form', component: 'useContactForm' });
      
      // Verificar si es un error de validación
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('Validación')) {
        toast({
          title: "Error de validación",
          description: errorMessage.replace('Validación del ', '').replace('Validación de la ', ''),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Hubo un problema enviando tu solicitud. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      }
      
      return { 
        error: error as Error, 
        isRateLimited: false, 
        remainingRequests: rateLimit.getRemainingRequests('contact-form')
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContactForm,
    isSubmitting,
    // Exponer funciones de rate limiting para el componente
    getRemainingRequests: () => rateLimit.getRemainingRequests('contact-form'),
    isRateLimited: () => rateLimit.isRateLimited('contact-form'),
    clearRateLimit: () => rateLimit.clearRateLimit('contact-form')
  };
};
