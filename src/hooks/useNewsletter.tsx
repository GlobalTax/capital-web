
import { useState } from 'react';

import { useToast } from '@/hooks/use-toast';

import type { NewsletterFormData, FormErrors } from '@/types/forms';
import { validateEmail } from '@/utils/validationUtils';

interface UseNewsletterReturn {
  subscribe: (data: NewsletterFormData) => Promise<boolean>;
  isSubmitting: boolean;
  errors: FormErrors;
}

export const useNewsletter = (): UseNewsletterReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();

  const validateForm = (data: NewsletterFormData): boolean => {
    const newErrors: FormErrors = {};

    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subscribe = async (data: NewsletterFormData): Promise<boolean> => {
    if (!validateForm(data)) {
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here would be the actual API call
      console.log('Suscripción al newsletter:', data);
      
      toast({
        title: "¡Suscripción exitosa!",
        description: "Gracias por suscribirte a nuestro newsletter.",
      });
      
      setErrors({});
      return true;
    } catch (error) {
      console.error('Error en suscripción:', error);
      toast({
        title: "Error",
        description: "Hubo un problema con tu suscripción. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    subscribe,
    isSubmitting,
    errors,
  };
};
