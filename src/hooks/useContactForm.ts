import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStorageFallback } from '@/hooks/useStorageFallback';
import { 
  contactFormSchema, 
  operationContactFormSchema, 
  type ContactFormData, 
  type OperationContactFormData,
  validateRequiredFields,
  getFieldErrors
} from '@/schemas/contactFormSchema';
import { z } from 'zod';

interface ContactFormResult {
  success: boolean;
  error?: string;
}

// Rate limiting configuration - 5 submissions per 10 minutes
const RATE_LIMIT_KEY = 'contact_form_submissions';
const MAX_SUBMISSIONS = 5;
const WINDOW_MINUTES = 10;

interface RateLimitData {
  submissions: number[];
  lastReset: number;
}

// Rate limiting utilities (updated to accept storage parameter)
const getRateLimitData = (storage: Storage): RateLimitData => {
  try {
    const stored = storage.getItem(RATE_LIMIT_KEY);
    return stored ? JSON.parse(stored) : { submissions: [], lastReset: Date.now() };
  } catch {
    return { submissions: [], lastReset: Date.now() };
  }
};

const setRateLimitData = (data: RateLimitData, storage: Storage): void => {
  try {
    storage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('⚠️ Could not store rate limit data:', error);
  }
};

const checkRateLimit = (storage: Storage): { allowed: boolean; remaining: number; resetMinutes: number } => {
  const now = Date.now();
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  const data = getRateLimitData(storage);
  
  // Reset if window expired
  if (now - data.lastReset > windowMs) {
    const newData = { submissions: [], lastReset: now };
    setRateLimitData(newData, storage);
    console.log('🔄 Rate limit window reset');
    return { allowed: true, remaining: MAX_SUBMISSIONS - 1, resetMinutes: WINDOW_MINUTES };
  }
  
  // Remove old submissions outside window
  const validSubmissions = data.submissions.filter(time => now - time < windowMs);
  data.submissions = validSubmissions;
  
  const allowed = validSubmissions.length < MAX_SUBMISSIONS;
  const remaining = Math.max(0, MAX_SUBMISSIONS - validSubmissions.length);
  const resetMinutes = Math.ceil((windowMs - (now - data.lastReset)) / (60 * 1000));
  
  console.log(`📊 Rate limit: ${validSubmissions.length}/${MAX_SUBMISSIONS}, remaining: ${remaining}`);
  
  return { allowed, remaining, resetMinutes };
};

const recordSubmission = (storage: Storage): void => {
  const data = getRateLimitData(storage);
  data.submissions.push(Date.now());
  setRateLimitData(data, storage);
  console.log(`📈 Rate limit: Recorded submission (${data.submissions.length}/${MAX_SUBMISSIONS})`);
};

// Tracking data utilities
const getTrackingData = (pageOrigin?: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    utm_source: urlParams.get('utm_source') || null,
    utm_medium: urlParams.get('utm_medium') || null,
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_term: urlParams.get('utm_term') || null,
    utm_content: urlParams.get('utm_content') || null,
    referrer: document.referrer || null,
    page_origin: pageOrigin || 'unknown',
    user_agent: navigator.userAgent,
  };
};

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { getSafeStorage, storageStatus } = useStorageFallback();

  const submitContactForm = async (formData: ContactFormData, pageOrigin?: string): Promise<ContactFormResult> => {
    if (isSubmitting) {
      console.warn('⚠️ ContactForm: Already submitting');
      return { success: false, error: 'Submission in progress' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    // Get safe storage (with fallback for Safari/Edge iOS)
    const safeStorage = getSafeStorage('local');
    
    console.log('🔍 Storage Status:', {
      localStorage: storageStatus.localStorage,
      sessionStorage: storageStatus.sessionStorage,
      indexedDB: storageStatus.indexedDB,
      isTrackingPrevented: storageStatus.isTrackingPrevented,
      browser: navigator.userAgent.substring(0, 50)
    });
    
    console.log('🚀 ContactForm: Starting submission', { 
      email: formData.email?.substring(0, 10) + '...', 
      pageOrigin,
      requiredComplete: validateRequiredFields(formData)
    });

    try {
      // 1. Validate form data
      console.log('🔍 Validating form data...');
      const validatedData = contactFormSchema.parse(formData);
      console.log('✅ Form validation passed');

      // 2. Honeypot check
      if (validatedData.website) {
        console.warn('🍯 Honeypot triggered - possible bot submission');
        toast({
          title: "Error de seguridad",
          description: "Intento de spam detectado. Recarga la página si eres humano.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limit check (using safe storage)
      const rateLimitCheck = checkRateLimit(safeStorage);
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 Rate limit exceeded');
        toast({
          title: "Límite alcanzado",
          description: `Máximo ${MAX_SUBMISSIONS} consultas cada ${WINDOW_MINUTES} minutos. Inténtalo en ${rateLimitCheck.resetMinutes} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Record submission for rate limiting (using safe storage)
      recordSubmission(safeStorage);

      // 5. Get tracking data
      const trackingData = getTrackingData(pageOrigin);
      console.log('📊 Tracking data collected');

      // 6. Insert lead (sell_leads for 'vender', fallback to contact_leads)
      console.log('💾 Inserting lead...');
      let contactData: any = null;
      let contactError: any = null;

      try {
        if (validatedData.serviceType === 'vender') {
          const sellLeadData = {
            full_name: validatedData.fullName.trim(),
            company: validatedData.company.trim(),
            email: validatedData.email.toLowerCase().trim(),
            phone: validatedData.phone?.trim() || null,
            message: validatedData.message?.trim() || null,
            status: 'new' as const,
            page_origin: pageOrigin || 'unknown',
            user_agent: navigator.userAgent.slice(0, 255),
            utm_source: trackingData.utm_source?.trim() || null,
            utm_medium: trackingData.utm_medium?.trim() || null,
            utm_campaign: trackingData.utm_campaign?.trim() || null,
            utm_term: trackingData.utm_term?.trim() || null,
            utm_content: trackingData.utm_content?.trim() || null,
            referrer: trackingData.referrer?.slice(0, 500) || null,
          };

          // Log detallado para debugging
          console.log('📤 Inserting sell_lead:', {
            full_name_length: sellLeadData.full_name.length,
            company_length: sellLeadData.company.length,
            email_valid: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sellLeadData.email),
            has_phone: !!sellLeadData.phone,
            has_message: !!sellLeadData.message,
            page_origin: sellLeadData.page_origin,
          });

          const { error } = await supabase
            .from('sell_leads')
            .insert([sellLeadData]);

          if (error) {
            // Log completo del error para debugging
            console.error('❌ sell_leads insert error:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              data_sent: {
                full_name_length: sellLeadData.full_name.length,
                company_length: sellLeadData.company.length,
                email_length: sellLeadData.email.length,
                email: sellLeadData.email,
              },
            });
            
            // Detectar errores específicos de RLS policy
            if (error.message?.includes('policy') || 
                error.message?.includes('check_rate_limit') ||
                error.message?.includes('violates row-level security')) {
              console.warn('⚠️ Rate limit o RLS policy violation en sell_leads');
              toast({
                title: "Límite temporal alcanzado",
                description: "Has alcanzado el límite de consultas. Contáctanos directamente al +34 695 717 490 o info@capittal.es",
                variant: "destructive",
                duration: 8000,
              });
              return { success: false, error: 'Rate limit - RLS policy' };
            }
            
            // Error genérico más informativo
            toast({
              title: "Error al enviar formulario",
              description: "Por favor verifica los campos e intenta nuevamente. Si persiste, contáctanos directamente.",
              variant: "destructive",
              duration: 6000,
            });
            
            console.warn('⚠️ sell_leads insert failed, falling back to contact_leads:', error.message);
            throw error;
          } else {
            contactData = { id: 'sell_lead_success' };
          }
        } else {
          if (validatedData.serviceType === 'comprar') {
            const acquisitionData = {
              full_name: validatedData.fullName,
              company: validatedData.company,
              email: validatedData.email,
              phone: validatedData.phone || null,
              investment_range: validatedData.investmentBudget || null,
              sectors_of_interest: validatedData.sectorsOfInterest || null,
              acquisition_type: null,
              target_timeline: null,
              additional_details: validatedData.message || null,
              status: 'new' as const,
              utm_source: trackingData.utm_source,
              utm_medium: trackingData.utm_medium,
              utm_campaign: trackingData.utm_campaign,
              referrer: trackingData.referrer,
              user_agent: navigator.userAgent.slice(0, 255),
            };

            const { error } = await supabase
              .from('acquisition_leads')
              .insert([acquisitionData]);

            if (error) throw error;
            contactData = { id: 'acquisition_lead_success' };
          } else {
            const contactLeadData = {
              full_name: validatedData.fullName,
              company: validatedData.company,
              phone: validatedData.phone || null,
              email: validatedData.email,
              service_type: validatedData.serviceType,
              investment_budget: validatedData.investmentBudget || null,
              sectors_of_interest: validatedData.sectorsOfInterest || null,
              status: 'new' as const,
              user_agent: navigator.userAgent.slice(0, 255),
            };

            const { error } = await supabase
              .from('contact_leads')
              .insert([contactLeadData]);

            if (error) throw error;
            contactData = { id: 'contact_lead_success' };
          }
        }
      } catch (primaryError: any) {
        // Fallback: try contact_leads to avoid losing the lead
        const contactLeadData = {
          full_name: validatedData.fullName,
          company: validatedData.company,
          phone: validatedData.phone || null,
          email: validatedData.email,
          service_type: validatedData.serviceType,
          investment_budget: validatedData.investmentBudget || null,
          sectors_of_interest: validatedData.sectorsOfInterest || null,
          status: 'new' as const,
          user_agent: navigator.userAgent.slice(0, 255),
        };

        const { error } = await supabase
          .from('contact_leads')
          .insert([contactLeadData]);

        if (error) {
          contactError = error;
        } else {
          contactData = { id: 'fallback_contact' };
        }
      }
      if (contactError) {
        console.error('❌ Contact lead insert failed:', contactError.message);
        
        if (contactError.message?.includes('rate limit')) {
          toast({
            title: "Límite de seguridad",
            description: "Has alcanzado el límite de envíos. Espera antes de intentar de nuevo.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al enviar",
            description: "No se pudo procesar tu consulta. Verifica los datos e inténtalo de nuevo.",
            variant: "destructive",
          });
        }
        return { success: false, error: contactError.message };
      }
      console.log('✅ Contact lead inserted:', contactData?.id || 'success');

      // 7. Send notifications (non-blocking)
      try {
        console.log('📧 Sending notifications...');
        const { error: functionError } = await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData?.id || 'unknown',
            formType: 'contact',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: {
              ...validatedData,
              ...trackingData,
              submission_timestamp: new Date().toISOString(),
            },
          }
        });

        if (functionError) {
          console.warn('⚠️ Notification send failed (non-blocking):', functionError.message);
        } else {
          console.log('✅ Notifications sent successfully');
        }
      } catch (notificationError) {
        console.warn('⚠️ Notification error (non-blocking):', notificationError);
      }

      // 8. Google Ads Enhanced Conversions (non-blocking)
      try {
        const { trackLeadEnhanced } = await import('@/utils/analytics/EnhancedConversions');
        await trackLeadEnhanced({
          email: validatedData.email,
          phone: validatedData.phone,
          name: validatedData.fullName,
          formType: validatedData.serviceType || 'contact'
        });
        console.log('✅ Google Ads Enhanced Conversion sent');
      } catch (conversionError) {
        console.warn('⚠️ Enhanced Conversion error (non-blocking):', conversionError);
      }

      // 9. Success
      const duration = Date.now() - startTime;
      console.log(`🎉 ContactForm: Success in ${duration}ms`);
      
      toast({
        title: "¡Consulta enviada!",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto para la valoración gratuita.",
        variant: "default",
      });

      return { success: true };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`💥 ContactForm: Failed after ${duration}ms:`, error);
      
      if (error instanceof z.ZodError) {
        console.error('📋 Validation errors:', getFieldErrors(error));
        toast({
          title: "Datos inválidos",
          description: "Revisa los campos marcados e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else if (error instanceof Error && error.message.includes('network')) {
        toast({
          title: "Error de conexión",
          description: "Verifica tu conexión a internet e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "Ha ocurrido un error. Por favor, inténtalo más tarde.",
          variant: "destructive",
        });
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOperationContactForm = async (formData: OperationContactFormData): Promise<ContactFormResult> => {
    if (isSubmitting) {
      console.warn('⚠️ OperationContactForm: Already submitting');
      return { success: false, error: 'Submission in progress' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    // Get safe storage (with fallback for Safari/Edge iOS)
    const safeStorage = getSafeStorage('local');
    
    console.log('🔍 Storage Status (Operation):', {
      localStorage: storageStatus.localStorage,
      sessionStorage: storageStatus.sessionStorage,
      browser: navigator.userAgent.substring(0, 50)
    });
    
    console.log('🚀 OperationContactForm: Starting submission', { 
      email: formData.email?.substring(0, 10) + '...',
      operationId: formData.operationId
    });

    try {
      // 1. Validate data
      const validatedData = operationContactFormSchema.parse(formData);
      console.log('✅ Operation form validation passed');

      // 2. Honeypot check
      if (validatedData.website) {
        console.warn('🍯 Operation form: Honeypot triggered');
        toast({
          title: "Error de seguridad",
          description: "Intento de spam detectado. Recarga la página.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limit check (using safe storage)
      const rateLimitCheck = checkRateLimit(safeStorage);
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 Operation form: Rate limit exceeded');
        toast({
          title: "Límite alcanzado",
          description: `Máximo ${MAX_SUBMISSIONS} consultas cada ${WINDOW_MINUTES} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      recordSubmission(safeStorage);

      // 4. Get tracking data
      const trackingData = getTrackingData('operation_inquiry');

      // 5. Insert contact lead
      console.log('💾 Inserting operation contact lead...');
      const { error: contactError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: validatedData.fullName,
          company: validatedData.companyName,
          phone: validatedData.phone || null,
          email: validatedData.email,
          service_type: null, // Operations don't have a service_type
          referral: `operation_${validatedData.operationId}`,
          status: 'new',
          user_agent: navigator.userAgent.slice(0, 255),
        }]);

      if (contactError) {
        console.error('❌ Operation contact lead failed:', contactError.message);
        toast({
          title: "Error al enviar",
          description: "No se pudo procesar tu consulta de operación.",
          variant: "destructive",
        });
        return { success: false, error: contactError.message };
      }

      console.log('✅ Operation contact lead inserted');

      // 6. Send notifications (non-blocking)
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: 'operation_contact',
            formType: 'operation_inquiry',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: {
              ...validatedData,
              ...trackingData,
              submission_timestamp: new Date().toISOString(),
            },
          }
        });
        console.log('✅ Operation notifications sent');
      } catch (error) {
        console.warn('⚠️ Operation notification error (non-blocking):', error);
      }

      // 7. Google Ads Enhanced Conversions (non-blocking)
      try {
        const { trackLeadEnhanced } = await import('@/utils/analytics/EnhancedConversions');
        await trackLeadEnhanced({
          email: validatedData.email,
          phone: validatedData.phone,
          name: validatedData.fullName,
          formType: 'operation_inquiry'
        });
        console.log('✅ Operation Enhanced Conversion sent');
      } catch (conversionError) {
        console.warn('⚠️ Operation Enhanced Conversion error (non-blocking):', conversionError);
      }

      // 8. Success
      const duration = Date.now() - startTime;
      console.log(`🎉 OperationContactForm: Success in ${duration}ms`);
      
      toast({
        title: "¡Consulta enviada!",
        description: `Hemos recibido tu interés en ${validatedData.companyName}. Te contactaremos pronto.`,
        variant: "default",
      });

      return { success: true };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`💥 OperationContactForm: Failed after ${duration}ms:`, error);
      
      if (error instanceof z.ZodError) {
        console.error('📋 Operation validation errors:', getFieldErrors(error));
        toast({
          title: "Datos inválidos",
          description: "Revisa los campos e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "No se pudo procesar la consulta de operación.",
          variant: "destructive",
        });
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContactForm,
    submitOperationContactForm,
    isSubmitting,
  };
};