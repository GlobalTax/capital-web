
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
import { ContactFormData } from '@/schemas/contactFormSchema';

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Rate limiting: 10 intentos por 5 minutos para formulario de contacto (configuración de pruebas)
  const rateLimit = useRateLimit({
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutos
    blockDurationMs: 5 * 60 * 1000 // bloquear por 5 minutos
  });

  const submitContactForm = async (formData: ContactFormData, pageOrigin?: string) => {
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
      // PASO 1: Sanitizar todos los campos antes de cualquier operación
      const sanitizedData = sanitizeObject(formData, {
        fullName: 'STRICT',
        company: 'STRICT',
        phone: 'STRICT',
        email: 'STRICT',
        serviceType: 'STRICT',
        message: 'STRICT'
      });

      // PASO 2: Validaciones individuales ANTES de rate limit y operaciones de red
      validateContactName(sanitizedData.fullName);
      validateCompanyName(sanitizedData.company);
      validateEmail(sanitizedData.email);
      
      if (sanitizedData.phone) {
        validateSpanishPhone(sanitizedData.phone);
      }

      // PASO 3: Si las validaciones pasan, verificar rate limit
      // Usar executeWithRateLimit para envolver solo las operaciones de red
      const result = await rateLimit.executeWithRateLimit(async () => {

        // Get UTM and referrer data
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source') || undefined;
        const utm_medium = urlParams.get('utm_medium') || undefined;
        const utm_campaign = urlParams.get('utm_campaign') || undefined;
        const referrer = document.referrer || undefined;
        
        const timestamp = new Date().toISOString();
        
        // PASO 4A: Log antes del insert en contact_leads
        const leadInsertData = {
          full_name: sanitizedData.fullName,
          company: sanitizedData.company,
          phone: sanitizedData.phone,
          email: sanitizedData.email,
          service_type: sanitizedData.serviceType,
          utm_source,
          utm_medium,
          utm_campaign,
          referral: referrer,
          status: 'new'
        };
        
        logger.info('📝 [ContactForm] Insertando en contact_leads', { 
          timestamp,
          insertData: { ...leadInsertData, email: '[REDACTED]' } 
        }, { context: 'database', component: 'useContactForm' });
        console.log('🔄 ContactForm: Iniciando insert en contact_leads', { timestamp });
        
        // Insert into contact_leads table
        const { data: leadData, error: leadError } = await supabase
          .from('contact_leads')
          .insert([leadInsertData])
          .select()
          .single();

        if (leadError) {
          // Log detallado del error de Supabase
          const errorDetails = {
            code: leadError.code,
            message: leadError.message,
            details: leadError.details,
            hint: leadError.hint,
            timestamp
          };
          
          logger.error('❌ [ContactForm] Error insertando en contact_leads', leadError, { 
            context: 'database', 
            component: 'useContactForm' 
          });
          
          // Browser debugging para errores específicos
          if (leadError.code === 'PGRST301' || leadError.message?.includes('RLS')) {
            console.error('🚫 RLS Policy Error (401/403) en contact_leads:', errorDetails);
            console.error('⚠️ Verifica las políticas RLS en contact_leads table');
          } else if (leadError.code === '429' || leadError.message?.includes('rate limit')) {
            console.error('⏱️ Rate Limit Error (429) en contact_leads:', errorDetails);
            console.error('⚠️ Demasiadas requests a la base de datos');
          } else {
            console.error('💥 Database Error en contact_leads:', errorDetails);
          }
          
          throw leadError;
        }
        
        // PASO 4B: Log después del insert exitoso en contact_leads
        logger.info('✅ [ContactForm] Insert exitoso en contact_leads', { 
          timestamp,
          leadId: leadData.id,
          generatedId: leadData.id
        }, { context: 'database', component: 'useContactForm' });
        console.log('✅ ContactForm: Insert exitoso en contact_leads', { leadId: leadData.id, timestamp });

        // PASO 5A: Log antes del insert en form_submissions
        const submissionInsertData = {
          form_type: 'contact_form',
          page_origin: pageOrigin || 'contact_page',
          email: sanitizedData.email,
          full_name: sanitizedData.fullName,
          phone: sanitizedData.phone,
          company: sanitizedData.company,
          form_data: sanitizedData as any,
          utm_source,
          utm_medium,
          utm_campaign,
          referrer,
          status: 'new'
        };
        
        logger.info('📝 [ContactForm] Insertando en form_submissions', { 
          timestamp,
          insertData: { ...submissionInsertData, email: '[REDACTED]', form_data: '[REDACTED]' } 
        }, { context: 'database', component: 'useContactForm' });
        console.log('🔄 ContactForm: Iniciando insert en form_submissions', { timestamp });

        // Insert into unified form_submissions table with proper structure
        const { data: submissionData, error: submissionError } = await supabase
          .from('form_submissions')
          .insert([submissionInsertData])
          .select()
          .single();

        if (submissionError) {
          // Log detallado del error de Supabase para form_submissions
          const errorDetails = {
            code: submissionError.code,
            message: submissionError.message,
            details: submissionError.details,
            hint: submissionError.hint,
            timestamp
          };
          
          logger.error('❌ [ContactForm] Error insertando en form_submissions', submissionError, { 
            context: 'database', 
            component: 'useContactForm' 
          });
          
          // Browser debugging para errores específicos
          if (submissionError.code === 'PGRST301' || submissionError.message?.includes('RLS')) {
            console.error('🚫 RLS Policy Error (401/403) en form_submissions:', errorDetails);
            console.error('⚠️ Verifica las políticas RLS en form_submissions table');
          } else if (submissionError.code === '429' || submissionError.message?.includes('rate limit')) {
            console.error('⏱️ Rate Limit Error (429) en form_submissions:', errorDetails);
            console.error('⚠️ Demasiadas requests a la base de datos');
          } else {
            console.error('💥 Database Error en form_submissions:', errorDetails);
          }
          
          // No lanzar error aquí ya que el lead principal se guardó correctamente
        } else {
          // PASO 5B: Log después del insert exitoso en form_submissions
          logger.info('✅ [ContactForm] Insert exitoso en form_submissions', { 
            timestamp,
            submissionId: submissionData.id,
            generatedId: submissionData.id
          }, { context: 'database', component: 'useContactForm' });
          console.log('✅ ContactForm: Insert exitoso en form_submissions', { submissionId: submissionData.id, timestamp });
        }

        // PASO 6: Enviar notificación por email (no bloquear si falla)
        if (submissionData?.id) {
          try {
            const functionParams = {
              submissionId: submissionData.id,
              formType: 'contact',
              email: sanitizedData.email,
              fullName: sanitizedData.fullName,
              formData: sanitizedData
            };
            
            logger.info('📧 [ContactForm] Invocando función send-form-notifications', { 
              timestamp,
              submissionId: submissionData.id,
              parameters: { ...functionParams, email: '[REDACTED]', formData: '[REDACTED]' }
            }, { context: 'form', component: 'useContactForm' });
            console.log('🔄 ContactForm: Invocando Edge Function send-form-notifications', { submissionId: submissionData.id, timestamp });
            
            const { data: functionData, error: functionError } = await supabase.functions.invoke('send-form-notifications', {
              body: functionParams
            });
            
            if (functionError) {
              // Log detallado del error de la función
              const errorDetails = {
                code: functionError.code,
                message: functionError.message,
                details: functionError.details,
                context: functionError.context,
                timestamp
              };
              
              logger.error('❌ [ContactForm] Error en función send-form-notifications', functionError, { 
                context: 'form', 
                component: 'useContactForm' 
              });
              
              // Browser debugging para errores HTTP de función
              if (functionError.message?.includes('401') || functionError.message?.includes('403')) {
                console.error('🚫 Auth Error (401/403) en Edge Function:', errorDetails);
                console.error('⚠️ Verifica permisos de la función send-form-notifications');
              } else if (functionError.message?.includes('429')) {
                console.error('⏱️ Rate Limit Error (429) en Edge Function:', errorDetails);
                console.error('⚠️ Edge Function rate limited');
              } else {
                console.error('💥 Function Error en send-form-notifications:', errorDetails);
              }
              
              throw functionError;
            }
            
            logger.info('✅ [ContactForm] Función send-form-notifications ejecutada correctamente', { 
              timestamp,
              submissionId: submissionData.id,
              functionResponse: functionData
            }, { context: 'form', component: 'useContactForm' });
            console.log('✅ ContactForm: Edge Function ejecutada correctamente', { submissionId: submissionData.id, response: functionData, timestamp });
            
          } catch (notificationError: any) {
            // Log detallado del error de notificación
            const errorDetails = {
              name: notificationError.name,
              message: notificationError.message,
              code: notificationError.code,
              details: notificationError.details,
              stack: notificationError.stack,
              timestamp
            };
            
            logger.warn('⚠️ [ContactForm] Error enviando notificación (no bloquea el formulario)', notificationError, { 
              context: 'form', 
              component: 'useContactForm' 
            });
            
            // Browser debugging específico para errores de notificación
            console.warn('⚠️ ContactForm: Error en notificación (no crítico)', errorDetails);
            if (notificationError.message?.includes('401') || notificationError.message?.includes('403')) {
              console.warn('🚫 Auth issue en notificación - formulario se guardó correctamente');
            } else if (notificationError.message?.includes('429')) {
              console.warn('⏱️ Rate limit en notificación - formulario se guardó correctamente');
            }
            
            // Toast informativo pero no destructivo
            toast({
              title: "Formulario enviado",
              description: "Tu solicitud fue registrada correctamente. La notificación por email puede tardar unos minutos.",
              variant: "default", // No destructive
            });
          }
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
