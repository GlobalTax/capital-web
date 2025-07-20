
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { rateLimit } from '@/utils/rateLimit';
import { logger } from '@/utils/logger';
import { ContactFormData, UseContactFormReturn } from '@/types/forms';
import { validateEmail } from '@/utils/emailValidation';

const initialFormData: ContactFormData = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
  company_size: '',
  country: '',
  referral: ''
};

export const useContactForm = (): UseContactFormReturn => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || 'Email inválido';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'La empresa es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ContactFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (rateLimit.isRateLimited('contact-form')) {
      logger.warn('⚠️ [ContactForm] Rate limit excedido', { 
        remainingRequests: rateLimit.getRemainingRequests('contact-form')
      }, { context: 'form', component: 'useContactForm' });
      
      toast({
        title: "Demasiados intentos",
        description: "Por favor espera un momento antes de enviar otro mensaje.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Error en el formulario",
        description: "Por favor corrige los errores antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      rateLimit.increment('contact-form');

      const submissionData = {
        ...formData,
        ip_address: null,
        user_agent: navigator.userAgent,
        status: 'new',
        email_sent: false,
        hubspot_sent: false
      };

      const { data, error } = await supabase
        .from('contact_leads')
        .insert([submissionData])
        .select()
        .single();

      if (error) {
        logger.error('❌ [ContactForm] Error insertando en Supabase', error, { context: 'form', component: 'useContactForm' });
        throw error;
      }

      logger.info('✅ [ContactForm] Lead guardado exitosamente', { leadId: data?.id });

      toast({
        title: "¡Mensaje enviado!",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });

      resetForm();

    } catch (error) {
      logger.error('❌ [ContactForm] Error general', error, { context: 'form', component: 'useContactForm' });
      
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu mensaje. Por favor inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = (): void => {
    setFormData(initialFormData);
    setErrors({});
  };

  return {
    formData,
    isLoading,
    errors,
    handleSubmit,
    handleChange,
    resetForm,
  };
};
