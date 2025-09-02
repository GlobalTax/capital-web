import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { contactFormSchema, operationContactFormSchema, type ContactFormData, type OperationContactFormData } from '@/schemas/contactFormSchema';

interface ContactFormResult {
  success: boolean;
  error?: string;
}

// Rate limiting storage (simple in-memory for now)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (identifier: string, maxRequests = 5, windowMinutes = 10): boolean => {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const current = rateLimitStore.get(identifier);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    console.warn(`Rate limit exceeded for ${identifier}: ${current.count}/${maxRequests}`);
    return false;
  }
  
  current.count++;
  return true;
};

export const useContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitContactForm = async (formData: ContactFormData, pageOrigin?: string): Promise<ContactFormResult> => {
    if (isSubmitting) return { success: false, error: 'Envío en progreso' };
    
    setIsSubmitting(true);
    console.log('📝 Starting contact form submission:', { 
      email: formData.email, 
      pageOrigin,
      timestamp: new Date().toISOString() 
    });

    try {
      // 1. Validate with Zod schema
      const validatedData = contactFormSchema.parse(formData);
      console.log('✅ Form data validated successfully');

      // 2. Anti-spam checks
      if (validatedData.website) {
        console.warn('🚫 Honeypot triggered:', validatedData.website);
        toast({
          title: "Error de validación",
          description: "Formulario inválido. Si eres humano, por favor recarga la página.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limiting check
      const clientIP = 'browser_' + (navigator.userAgent + navigator.language).slice(0, 20);
      if (!checkRateLimit(clientIP, 5, 10)) {
        toast({
          title: "Límite de envíos alcanzado",
          description: "Has alcanzado el máximo de envíos permitidos (5 cada 10 minutos). Por favor, espera.",
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Insert into contact_leads table
      console.log('💾 Inserting into contact_leads...');
      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: validatedData.fullName,
          company: validatedData.company,
          phone: validatedData.phone || null,
          email: validatedData.email,
          country: validatedData.country || null,
          company_size: validatedData.companySize || null,
          referral: validatedData.referral || null,
          status: 'new',
          ip_address: null, // Will be set by RLS if available
          user_agent: navigator.userAgent.slice(0, 255),
        }])
        .select()
        .single();

      if (contactError) {
        console.error('❌ Error inserting contact lead:', contactError);
        
        if (contactError.message?.includes('rate limit') || contactError.message?.includes('check_rate_limit_enhanced')) {
          toast({
            title: "Límite de envíos alcanzado",
            description: "Has alcanzado el máximo de envíos permitidos. Por favor, espera antes de intentar de nuevo.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error al enviar",
            description: "Ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          });
        }
        return { success: false, error: contactError.message };
      }

      console.log('✅ Contact lead inserted successfully:', contactData.id);

      // 5. Insert into form_submissions table (non-blocking)
      const formSubmissionData = {
        form_type: 'contact_form' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.company,
        form_data: {
          ...validatedData,
          pageOrigin: pageOrigin || 'unknown',
          referrer: document.referrer || null,
          timestamp: new Date().toISOString(),
        },
        status: 'new' as const,
        ip_address: null,
        user_agent: navigator.userAgent.slice(0, 255),
      };

      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([formSubmissionData]);

      if (formError) {
        console.warn('⚠️ Error inserting form submission (non-blocking):', formError);
      } else {
        console.log('✅ Form submission recorded');
      }

      // 6. Send notifications via Edge Function (non-blocking)
      try {
        console.log('📧 Sending notifications...');
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData.id,
            formType: 'contact',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: formSubmissionData.form_data,
          }
        });
        console.log('✅ Notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ Error sending notifications (non-blocking):', notificationError);
      }

      // 7. Success feedback
      toast({
        title: "¡Mensaje enviado!",
        description: "Hemos recibido tu solicitud. Te contactaremos pronto.",
        variant: "default",
      });

      console.log('🎉 Contact form submission completed successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Contact form submission failed:', error);
      
      if (error instanceof Error && error.message.includes('Invalid input')) {
        toast({
          title: "Datos inválidos",
          description: "Por favor, revisa los campos e inténtalo de nuevo.",
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

  const submitOperationContactForm = async (formData: OperationContactFormData): Promise<ContactFormResult> => {
    if (isSubmitting) return { success: false, error: 'Envío en progreso' };
    
    setIsSubmitting(true);
    console.log('📝 Starting operation contact form submission:', { 
      email: formData.email, 
      operationId: formData.operationId,
      timestamp: new Date().toISOString() 
    });

    try {
      // 1. Validate with Zod schema
      const validatedData = operationContactFormSchema.parse(formData);
      console.log('✅ Operation form data validated successfully');

      // 2. Anti-spam checks (same as regular form)
      if (validatedData.website) {
        console.warn('🚫 Honeypot triggered:', validatedData.website);
        toast({
          title: "Error de validación",
          description: "Formulario inválido. Si eres humano, por favor recarga la página.",
          variant: "destructive",
        });
        return { success: false, error: 'Honeypot triggered' };
      }

      // 3. Rate limiting check
      const clientIP = 'operation_' + (navigator.userAgent + navigator.language).slice(0, 20);
      if (!checkRateLimit(clientIP, 3, 30)) { // Stricter for operations
        toast({
          title: "Límite de envíos alcanzado",
          description: "Has alcanzado el máximo de consultas de operaciones (3 cada 30 minutos).",
          variant: "destructive",
        });
        return { success: false, error: 'Rate limit exceeded' };
      }

      // 4. Insert into contact_leads table
      console.log('💾 Inserting operation inquiry into contact_leads...');
      const { data: contactData, error: contactError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: validatedData.fullName,
          company: validatedData.companyName,
          phone: validatedData.phone || null,
          email: validatedData.email,
          country: validatedData.country || null,
          company_size: validatedData.companySize || null,
          referral: 'operacion_' + validatedData.operationId,
          status: 'new',
          ip_address: null,
          user_agent: navigator.userAgent.slice(0, 255),
        }])
        .select()
        .single();

      if (contactError) {
        console.error('❌ Error inserting operation contact lead:', contactError);
        toast({
          title: "Error al enviar",
          description: "Ha ocurrido un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
        return { success: false, error: contactError.message };
      }

      console.log('✅ Operation contact lead inserted successfully:', contactData.id);

      // 5. Insert into form_submissions table (non-blocking)
      const formSubmissionData = {
        form_type: 'operation_inquiry' as const,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        company: validatedData.companyName,
        form_data: {
          ...validatedData,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString(),
        },
        status: 'new' as const,
        ip_address: null,
        user_agent: navigator.userAgent.slice(0, 255),
      };

      const { error: formError } = await supabase
        .from('form_submissions')
        .insert([formSubmissionData]);

      if (formError) {
        console.warn('⚠️ Error inserting operation form submission (non-blocking):', formError);
      } else {
        console.log('✅ Operation form submission recorded');
      }

      // 6. Send notifications via Edge Function (non-blocking)
      try {
        console.log('📧 Sending operation notifications...');
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: contactData.id,
            formType: 'operation_inquiry',
            email: validatedData.email,
            fullName: validatedData.fullName,
            formData: formSubmissionData.form_data,
          }
        });
        console.log('✅ Operation notifications sent successfully');
      } catch (notificationError) {
        console.warn('⚠️ Error sending operation notifications (non-blocking):', notificationError);
      }

      // 7. Success feedback
      toast({
        title: "¡Consulta enviada!",
        description: `Hemos recibido tu interés en ${validatedData.companyName}. Te contactaremos pronto.`,
        variant: "default",
      });

      console.log('🎉 Operation contact form submission completed successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Operation contact form submission failed:', error);
      
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
      
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