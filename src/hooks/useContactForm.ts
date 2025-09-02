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

// Rate limiting configuration - 5 submissions per 10 minutes
const RATE_LIMIT_KEY = 'contact_form_submissions';
const MAX_SUBMISSIONS = 5;
const WINDOW_MINUTES = 10;

interface RateLimitData {
  submissions: number[];
  lastReset: number;
}

// Rate limiting utilities
const getRateLimitData = (): RateLimitData => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    return stored ? JSON.parse(stored) : { submissions: [], lastReset: Date.now() };
  } catch {
    return { submissions: [], lastReset: Date.now() };
  }
};

const setRateLimitData = (data: RateLimitData): void => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('⚠️ Could not store rate limit data:', error);
  }
};

const checkRateLimit = (): { allowed: boolean; remaining: number; resetMinutes: number } => {
  const now = Date.now();
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  const data = getRateLimitData();
  
  // Reset if window expired
  if (now - data.lastReset > windowMs) {
    const newData = { submissions: [], lastReset: now };
    setRateLimitData(newData);
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

const recordSubmission = (): void => {
  const data = getRateLimitData();
  data.submissions.push(Date.now());
  setRateLimitData(data);
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

  const submitContactForm = async (formData: ContactFormData, pageOrigin?: string): Promise<ContactFormResult> => {
    if (isSubmitting) {
      console.warn('⚠️ ContactForm: Already submitting');
      return { success: false, error: 'Submission in progress' };
    }
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
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

      // 3. Rate limit check
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 Rate limit exceeded');
        toast({
          title: "Límite alcanzado",
          description: `Máximo ${MAX_SUBMISSIONS} consultas cada ${WINDOW_MINUTES} minutos. Inténtalo en ${rateLimitCheck.resetMinutes} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Record submission for rate limiting
      recordSubmission();

      // 5. Get tracking data
      const trackingData = getTrackingData(pageOrigin);
      console.log('📊 Tracking data collected');

      // 6. Insert into contact_leads
      console.log('💾 Inserting contact lead...');
      const contactLeadData = {
        full_name: validatedData.fullName,
        company: validatedData.company,
        phone: validatedData.phone || null,
        email: validatedData.email,
        country: validatedData.country || null,
        company_size: validatedData.companySize || null,
        referral: validatedData.referral || null,
        status: 'new' as const,
        user_agent: navigator.userAgent.slice(0, 255),
      };

      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([contactLeadData])
        .select()
        .single();

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

      console.log('✅ Contact lead inserted:', contactData.id);

      // 7. Insert into form_submissions (non-blocking)
      console.log('💾 Recording form submission...');
      const formSubmissionData = {
        form_type: 'contact_form' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company,
        form_data: {
          ...validatedData,
          ...trackingData,
          submission_timestamp: new Date().toISOString(),
        },
        status: 'new' as const,
        user_agent: navigator.userAgent.slice(0, 255),
      };

      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([formSubmissionData]);

      if (formError) {
        console.warn('⚠️ Form submission insert failed (non-blocking):', formError.message);
      } else {
        console.log('✅ Form submission recorded');
      }

      // 8. Send notifications (non-blocking)
      try {
        console.log('📧 Sending notifications...');
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
          console.warn('⚠️ Notification send failed (non-blocking):', functionError.message);
        } else {
          console.log('✅ Notifications sent successfully');
        }
      } catch (notificationError) {
        console.warn('⚠️ Notification error (non-blocking):', notificationError);
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

      // 3. Rate limit check
      const rateLimitCheck = checkRateLimit();
      if (!rateLimitCheck.allowed) {
        console.warn('🚫 Operation form: Rate limit exceeded');
        toast({
          title: "Límite alcanzado",
          description: `Máximo ${MAX_SUBMISSIONS} consultas cada ${WINDOW_MINUTES} minutos.`,
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      recordSubmission();

      // 4. Get tracking data
      const trackingData = getTrackingData('operation_inquiry');

      // 5. Insert contact lead
      console.log('💾 Inserting operation contact lead...');
      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: validatedData.fullName,
          company: validatedData.companyName,
          phone: validatedData.phone || null,
          email: validatedData.email,
          country: validatedData.country || null,
          company_size: validatedData.companySize || null,
          referral: `operation_${validatedData.operationId}`,
          status: 'new',
          user_agent: navigator.userAgent.slice(0, 255),
        }])
        .select()
        .single();

      if (contactError) {
        console.error('❌ Operation contact lead failed:', contactError.message);
        toast({
          title: "Error al enviar",
          description: "No se pudo procesar tu consulta de operación.",
          variant: "destructive",
        });
        return { success: false, error: contactError.message };
      }

      console.log('✅ Operation contact lead inserted:', contactData.id);

      // 6. Insert form submission (non-blocking)
      const formSubmissionData = {
        form_type: 'operation_inquiry' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.companyName,
        form_data: {
          ...validatedData,
          ...trackingData,
          submission_timestamp: new Date().toISOString(),
        },
        status: 'new' as const,
        user_agent: navigator.userAgent.slice(0, 255),
      };

      await supabase.from('form_submissions').insert([formSubmissionData]);

      // 7. Send notifications (non-blocking)
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData.id,
            formType: 'operation_inquiry',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: formSubmissionData.form_data,
          }
        });
        console.log('✅ Operation notifications sent');
      } catch (error) {
        console.warn('⚠️ Operation notification error (non-blocking):', error);
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