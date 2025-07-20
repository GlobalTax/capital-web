
import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

import type { ContactFormData, FormErrors } from '@/types/forms';
import { validateContactName, validateEmail } from '@/utils/validationUtils';

interface UseContactFormReturn {
  submitForm: (data: ContactFormData) => Promise<boolean>;
  isSubmitting: boolean;
  errors: FormErrors;
}

export const useContactForm = (): UseContactFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const validateForm = (data: ContactFormData): boolean => {
    const newErrors: FormErrors = {};

    const nameValidation = validateContactName(data.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    if (!data.message || data.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async (data: ContactFormData): Promise<boolean> => {
    if (!validateForm(data)) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here would be the actual API call
      console.log('Formulario enviado:', data);
      
      toast({
        title: "¡Mensaje enviado!",
        description: "Te responderemos en menos de 24 horas.",
      });
      
      setErrors({});
      return true;
    } catch (error) {
      console.error('Error enviando formulario:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting,
    errors,
  };
};
