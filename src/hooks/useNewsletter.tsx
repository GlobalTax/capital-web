
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UseNewsletterReturn } from '@/types/forms';
import { validateEmail } from '@/utils/emailValidation';

export const useNewsletter = (): UseNewsletterReturn => {
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message || 'Email inválido');
      return;
    }

    setIsLoading(true);

    try {
      const { error: supabaseError } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          email: emailValidation.sanitizedValue || email,
          full_name: fullName.trim() || null,
          company: company.trim() || null,
          source: 'website',
          interests: [],
          user_agent: navigator.userAgent,
        }]);

      if (supabaseError) {
        if (supabaseError.code === '23505') { // Unique constraint violation
          setError('Este email ya está suscrito a nuestro newsletter');
          return;
        }
        throw supabaseError;
      }

      setSuccess(true);
      toast({
        title: "¡Suscripción exitosa!",
        description: "Te has suscrito correctamente a nuestro newsletter.",
      });

      reset();

    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError('Error al procesar la suscripción. Inténtalo de nuevo.');
      
      toast({
        title: "Error",
        description: "No se pudo completar la suscripción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string): void => setEmail(value);
  const handleNameChange = (value: string): void => setFullName(value);
  const handleCompanyChange = (value: string): void => setCompany(value);

  const reset = (): void => {
    setEmail('');
    setFullName('');
    setCompany('');
    setError(null);
    setSuccess(false);
  };

  return {
    email,
    fullName,
    company,
    isLoading,
    error,
    success,
    handleSubmit,
    handleEmailChange,
    handleNameChange,
    handleCompanyChange,
    reset,
  };
};
