import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface OperationContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  operationId: string;
  companyName: string;
}

export const useOperationContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitOperationContactForm = async (formData: OperationContactFormData) => {
    setIsSubmitting(true);

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] === OPERATION CONTACT FORM SUBMISSION START ===`);
    console.log('Form data:', formData);

    try {
      // Validation
      if (!formData.name?.trim() || formData.name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      if (!formData.email?.trim() || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
        throw new Error('Email inválido');
      }
      if (!formData.message?.trim()) {
        throw new Error('El mensaje es obligatorio');
      }

      // Prepare data for insert
      const urlParams = new URLSearchParams(window.location.search);
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        message: formData.message.trim(),
        operation_id: formData.operationId,
        company_name: formData.companyName,
        ip_address: null, // Will be set by server
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      console.log('Payload for operation_inquiries insert:', payload);

      // Step 1: Insert into operation_inquiries table
      console.log('=== STEP 1: INSERTING INTO operation_inquiries ===');
      const { data: operationData, error: operationError } = await supabase
        .from('operation_inquiries')
        .insert(payload)
        .select()
        .single();

      if (operationError) {
        console.error('Error inserting into operation_inquiries:', {
          code: operationError.code,
          message: operationError.message,
          details: operationError.details,
          hint: operationError.hint
        });

        // Handle specific errors
        if (operationError.message?.includes('rate limit') || operationError.message?.includes('check_rate_limit_enhanced')) {
          console.warn('Rate limit exceeded for operation contact');
          toast({
            title: "Límite de envíos alcanzado",
            description: "Solo se permiten 3 consultas por IP cada 24 horas. Si necesitas contactar urgentemente, llama al +34 695 717 490.",
            variant: "destructive",
          });
          return { success: false, error: 'rate_limit' };
        }

        if (operationError.message?.includes('row-level security') || operationError.code === '42501') {
          console.error('RLS policy violation in operation_inquiries');
          toast({
            title: "Error de validación",
            description: "Los datos del formulario no cumplen con los requisitos. Revisa todos los campos.",
            variant: "destructive",
          });
          return { success: false, error: 'validation' };
        }

        throw operationError;
      }

      console.log('Successfully inserted into operation_inquiries:', operationData);

      // Step 2: Insert into form_submissions
      console.log('=== STEP 2: INSERTING INTO form_submissions ===');
      const formSubmissionPayload = {
        form_type: 'operation_contact',
        email: formData.email.trim(),
        full_name: formData.name.trim(),
        form_data: {
          phone: formData.phone?.trim() || null,
          message: formData.message.trim(),
          operation_id: formData.operationId,
          company_name: formData.companyName,
        },
        ip_address: null, // Will be set by server
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      console.log('Payload for form_submissions insert:', formSubmissionPayload);

      const { data: submissionData, error: submissionError } = await supabase
        .from('form_submissions')
        .insert(formSubmissionPayload)
        .select()
        .single();

      if (submissionError) {
        console.error('Error inserting into form_submissions:', {
          code: submissionError.code,
          message: submissionError.message,
          details: submissionError.details,
          hint: submissionError.hint
        });
        // Don't block if this fails - the main submission succeeded
      } else {
        console.log('Successfully inserted into form_submissions:', submissionData);

        // Step 3: Invoke send-form-notifications function
        console.log('=== STEP 3: INVOKING send-form-notifications FUNCTION ===');
        try {
          const functionPayload = {
            submissionId: submissionData.id,
            formType: 'operation_contact',
            email: formData.email.trim(),
            fullName: formData.name.trim(),
            formData: {
              phone: formData.phone?.trim() || null,
              message: formData.message.trim(),
              operation_id: formData.operationId,
              company_name: formData.companyName,
            }
          };

          console.log('Function payload:', functionPayload);

          const { data: functionData, error: functionError } = await supabase.functions.invoke(
            'send-form-notifications',
            { body: functionPayload }
          );

          if (functionError) {
            console.error('Error invoking send-form-notifications function:', {
              code: functionError.code,
              message: functionError.message,
              details: functionError.details
            });
            // Non-blocking error - notification failed but form submitted
          } else {
            console.log('Successfully invoked send-form-notifications function:', functionData);
          }
        } catch (functionErr) {
          console.error('Exception invoking send-form-notifications function:', functionErr);
          // Non-blocking error
        }
      }

      toast({
        title: "Consulta enviada",
        description: "Nos pondremos en contacto contigo pronto para hablar sobre esta oportunidad.",
        variant: "default",
      });

      console.log(`[${new Date().toISOString()}] === OPERATION CONTACT FORM SUBMISSION SUCCESS ===`);
      return { success: true, data: operationData };

    } catch (error) {
      console.error('Error in operation contact form submission:', error);
      
      toast({
        title: "Error",
        description: "No se pudo enviar la consulta. Inténtalo de nuevo o contacta directamente al +34 695 717 490.",
        variant: "destructive",
      });

      return { success: false, error: error instanceof Error ? error.message : 'unknown_error' };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitOperationContactForm,
    isSubmitting
  };
};