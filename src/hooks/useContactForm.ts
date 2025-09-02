import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

// Enhanced rate limiting with localStorage persistence
const RATE_LIMIT_KEY = 'contact_form_rate_limit';
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

interface RateLimitData {
  count: number;
  resetTime: number;
  attempts: Array<{ timestamp: number; ip?: string }>;
}

const getRateLimitData = (): RateLimitData => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('📊 Rate limit: Error reading stored data:', error);
  }
  
  return {
    count: 0,
    resetTime: Date.now() + (RATE_LIMIT_WINDOW_MINUTES * 60 * 1000),
    attempts: []
  };
};

const setRateLimitData = (data: RateLimitData): void => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('📊 Rate limit: Error storing data:', error);
  }
};

const checkRateLimit = (): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const data = getRateLimitData();
  
  // Reset window if expired
  if (now > data.resetTime) {
    const newData: RateLimitData = {
      count: 0,
      resetTime: now + (RATE_LIMIT_WINDOW_MINUTES * 60 * 1000),
      attempts: []
    };
    setRateLimitData(newData);
    console.log('📊 Rate limit: Window reset');
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MINUTES * 60 };
  }
  
  // Clean old attempts (older than window)
  const windowStart = data.resetTime - (RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  data.attempts = data.attempts.filter(attempt => attempt.timestamp > windowStart);
  data.count = data.attempts.length;
  
  const allowed = data.count < RATE_LIMIT_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_REQUESTS - data.count);
  const resetIn = Math.ceil((data.resetTime - now) / 1000);
  
  console.log(`📊 Rate limit check: ${data.count}/${RATE_LIMIT_REQUESTS}, remaining: ${remaining}, resetIn: ${resetIn}s`);
  
  return { allowed, remaining, resetIn };
};

const incrementRateLimit = (): void => {
  const data = getRateLimitData();
  data.attempts.push({ timestamp: Date.now() });
  data.count = data.attempts.length;
  setRateLimitData(data);
  console.log(`📊 Rate limit: Incremented to ${data.count}/${RATE_LIMIT_REQUESTS}`);
};

// Utility to extract UTM parameters and referrer
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
  };
};

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitContactForm = async (formData: ContactFormData, pageOrigin?: string): Promise<ContactFormResult> => {
    if (isSubmitting) {
      console.warn('📝 ContactForm: Submission already in progress');
      return { success: false, error: 'Envío en progreso' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    console.log('📝 ContactForm: Starting submission', { 
      email: formData.email, 
      pageOrigin,
      hasRequiredFields: validateRequiredFields(formData),
      timestamp: new Date().toISOString() 
    });

    try {
      // 1. Client-side validation with Zod
      console.log('📝 ContactForm: Validating data...');
      const validatedData = contactFormSchema.parse(formData);
      console.log('✅ ContactForm: Data validation successful');

      // 2. Anti-spam honeypot check
      if (validatedData.website) {
        console.warn('🚫 ContactForm: Honeypot triggered:', validatedData.website);
        toast({
          title: "Error de seguridad",
          description: "Formulario inválido detectado. Si eres humano, recarga la página.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limiting check
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 ContactForm: Rate limit exceeded');
        const resetMinutes = Math.ceil(rateLimitCheck.resetIn / 60);
        toast({
          title: "Límite de envíos alcanzado",
          description: `Has alcanzado el máximo de envíos permitidos (${RATE_LIMIT_REQUESTS} cada ${RATE_LIMIT_WINDOW_MINUTES} minutos). Podrás enviar otra consulta en ${resetMinutes} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Increment rate limit counter
      incrementRateLimit();

      // 5. Get tracking data
      const trackingData = getTrackingData(pageOrigin);
      console.log('📊 ContactForm: Tracking data collected', trackingData);

      // 6. Insert into contact_leads table
      console.log('💾 ContactForm: Inserting into contact_leads...');
      const contactLeadData = {
        full_name: validatedData.fullName,
        company: validatedData.company,
        phone: validatedData.phone || null,
        email: validatedData.email,
        country: validatedData.country || null,
        company_size: validatedData.companySize || null,
        referral: validatedData.referral || null,
        message: validatedData.message || null,
        status: 'new' as const,
        ip_address: null, // Will be set by RLS if available
        user_agent: navigator.userAgent.slice(0, 255),
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        referrer: trackingData.referrer,
      };

      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([contactLeadData])
        .select()
        .single();

      if (contactError) {
        console.error('❌ ContactForm: Error inserting contact lead:', contactError);
        
        // Handle specific rate limit errors from database
        if (contactError.message?.includes('rate limit') || contactError.message?.includes('check_rate_limit_enhanced')) {
          toast({
            title: "Límite de envíos alcanzado",
            description: "Has alcanzado el máximo de envíos permitidos desde tu conexión. Por favor, espera antes de intentar de nuevo.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al enviar",
            description: "Ha ocurrido un error al procesar tu solicitud. Por favor, verifica tus datos e inténtalo de nuevo.",
            variant: "destructive",
          });
        }
        return { success: false, error: contactError.message };
      }

      console.log('✅ ContactForm: Contact lead inserted successfully', { id: contactData.id });

      // 7. Insert into form_submissions table (non-blocking)
      const formSubmissionData = {
        form_type: 'contact_form' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company,
        form_data: {
          ...validatedData,
          ...trackingData,
          submission_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        status: 'new' as const,
        ip_address: null,
        user_agent: navigator.userAgent.slice(0, 255),
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        referrer: trackingData.referrer,
      };

      console.log('💾 ContactForm: Inserting into form_submissions...');
      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([formSubmissionData]);

      if (formError) {
        console.warn('⚠️ ContactForm: Error inserting form submission (non-blocking):', formError);
      } else {
        console.log('✅ ContactForm: Form submission recorded');
      }

      // 8. Send notifications via Edge Function (non-blocking)
      try {
        console.log('📧 ContactForm: Sending notifications...');
        const { error: functionError } = await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData.id,
            formType: 'contact',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: formSubmissionData.form_data,
          }
        });

        if (functionError) {
          console.warn('⚠️ ContactForm: Error sending notifications (non-blocking):', functionError);
        } else {
          console.log('✅ ContactForm: Notifications sent successfully');
        }
      } catch (notificationError) {
        console.warn('⚠️ ContactForm: Exception sending notifications (non-blocking):', notificationError);
      }

      // 9. Success feedback
      const duration = Date.now() - startTime;
      console.log(`🎉 ContactForm: Submission completed successfully in ${duration}ms`);
      
      toast({
        title: "¡Consulta enviada!",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto para ayudarte con la valoración de tu empresa.",
        variant: "default",
      });

      return { success: true };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ContactForm: Submission failed after ${duration}ms:`, error);
      
      if (error instanceof z.ZodError) {
        console.error('📝 ContactForm: Validation errors:', getFieldErrors(error));
        toast({
          title: "Datos inválidos",
          description: "Por favor, revisa los campos marcados e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else if (error instanceof Error && error.message.includes('network')) {
        toast({
          title: "Error de conexión",
          description: "Problema de conexión. Verifica tu internet e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.",
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
      console.warn('📝 OperationContactForm: Submission already in progress');
      return { success: false, error: 'Envío en progreso' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    console.log('📝 OperationContactForm: Starting submission', { 
      email: formData.email, 
      operationId: formData.operationId,
      companyName: formData.companyName,
      timestamp: new Date().toISOString() 
    });

    try {
      // 1. Validate with Zod schema
      const validatedData = operationContactFormSchema.parse(formData);
      console.log('✅ OperationContactForm: Data validation successful');

      // 2. Anti-spam honeypot check
      if (validatedData.website) {
        console.warn('🚫 OperationContactForm: Honeypot triggered:', validatedData.website);
        toast({
          title: "Error de seguridad",
          description: "Formulario inválido detectado. Si eres humano, recarga la página.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limiting check (stricter for operations)
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 OperationContactForm: Rate limit exceeded');
        const resetMinutes = Math.ceil(rateLimitCheck.resetIn / 60);
        toast({
          title: "Límite de consultas alcanzado",
          description: `Has alcanzado el máximo de consultas de operaciones permitidas. Podrás enviar otra consulta en ${resetMinutes} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Increment rate limit counter
      incrementRateLimit();

      // 5. Get tracking data
      const trackingData = getTrackingData('operation_inquiry');

      // 6. Insert into contact_leads table
      console.log('💾 OperationContactForm: Inserting into contact_leads...');
      const contactData = await supabase
        .from('contact_leads')
        .insert([{
          full_name: validatedData.fullName,
          company: validatedData.companyName,
          phone: validatedData.phone || null,
          email: validatedData.email,
          country: validatedData.country || null,
          company_size: validatedData.companySize || null,
          referral: `operacion_${validatedData.operationId}`,
          message: validatedData.message || null,
          status: 'new',
          ip_address: null,
          user_agent: navigator.userAgent.slice(0, 255),
          utm_source: trackingData.utm_source,
          utm_medium: trackingData.utm_medium,
          utm_campaign: trackingData.utm_campaign,
          referrer: trackingData.referrer,
        }])
        .select()
        .single();

      if (contactData.error) {
        console.error('❌ OperationContactForm: Error inserting contact lead:', contactData.error);
        toast({
          title: "Error al enviar",
          description: "Ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        return { success: false, error: contactData.error.message };
      }

      console.log('✅ OperationContactForm: Contact lead inserted', { id: contactData.data.id });

      // 7. Insert into form_submissions table (non-blocking)
      const formSubmissionData = {
        form_type: 'operation_inquiry' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.companyName,
        form_data: {
          ...validatedData,
          ...trackingData,
          submission_time: new Date().toISOString(),
        },
        status: 'new' as const,
        ip_address: null,
        user_agent: navigator.userAgent.slice(0, 255),
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        referrer: trackingData.referrer,
      };

      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([formSubmissionData]);

      if (formError) {
        console.warn('⚠️ OperationContactForm: Error inserting form submission (non-blocking):', formError);
      } else {
        console.log('✅ OperationContactForm: Form submission recorded');
      }

      // 8. Send notifications via Edge Function (non-blocking)
      try {
        console.log('📧 OperationContactForm: Sending notifications...');
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData.data.id,
            formType: 'operation_inquiry',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: formSubmissionData.form_data,
          }
        });
        console.log('✅ OperationContactForm: Notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ OperationContactForm: Error sending notifications (non-blocking):', notificationError);
      }

      // 9. Success feedback
      const duration = Date.now() - startTime;
      console.log(`🎉 OperationContactForm: Submission completed successfully in ${duration}ms`);
      
      toast({
        title: "¡Consulta enviada!",
        description: `Hemos recibido tu interés en ${validatedData.companyName}. Te contactaremos pronto con más información.`,
        variant: "default",
      });

      return { success: true };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ OperationContactForm: Submission failed after ${duration}ms:`, error);
      
      if (error instanceof z.ZodError) {
        console.error('📝 OperationContactForm: Validation errors:', getFieldErrors(error));
        toast({
          title: "Datos inválidos",
          description: "Por favor, revisa los campos marcados e inténtalo de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
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