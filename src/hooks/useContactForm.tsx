
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

        // Validaciones específicas con sanitización
        const nameValidation = validateContactName(sanitizedData.fullName);
        if (!nameValidation.isValid) {
          throw new Error(`Validación del nombre: ${nameValidation.message}`);
        }

        const companyValidation = validateCompanyName(sanitizedData.company);
        if (!companyValidation.isValid) {
          throw new Error(`Validación de la empresa: ${companyValidation.message}`);
        }

        const emailValidation = validateEmail(sanitizedData.email);
        if (!emailValidation.isValid) {
          throw new Error(`Validación del email: ${emailValidation.message}`);
        }

        // Validar teléfono si se proporciona
        if (sanitizedData.phone) {
          const phoneValidation = validateSpanishPhone(sanitizedData.phone);
          if (!phoneValidation.isValid) {
            throw new Error(`Validación del teléfono: ${phoneValidation.message}`);
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
          logger.error('❌ [ContactForm] Error insertando en Supabase', error, { context: 'database', component: 'useContactForm' });
          throw error;
        }
        
        logger.info('✅ [ContactForm] Formulario enviado exitosamente', { leadId: data.id }, { context: 'form', component: 'useContactForm' });

        return data;
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
