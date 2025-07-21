
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMAErrorHandler } from './useMAErrorHandler';
import { 
  ValidationError, 
  NetworkError, 
  HubSpotIntegrationError,
  CompanyDataError 
} from '@/types/errorTypes';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  fullName: string;
  name?: string;
  email: string;
  phone: string;
  company: string;
  message?: string;
  service?: string;
  referral?: string;
}

// Adapter function for component compatibility  
const adaptFormData = (formData: any): ContactFormData => {
  return {
    fullName: formData.name || formData.fullName || '',
    name: formData.name,
    email: formData.email || '',
    phone: formData.phone || '',
    company: formData.company || '',
    message: formData.message,
    service: formData.service,
    referral: formData.referral
  };
};

interface UseContactFormReturn {
  isSubmitting: boolean;
  submitForm: (data: any) => Promise<boolean>;
  validateForm: (data: ContactFormData) => Promise<void>;
  errors: Record<string, string>;
}

export const useContactForm = (): UseContactFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { 
    handleHubSpotError, 
    handleCompanyDataError,
    createFinancialDataError 
  } = useMAErrorHandler();

  const validateForm = useCallback(async (data: ContactFormData) => {
    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new ValidationError('Email inválido', 'email', data.email);
    }

    // Validación de teléfono español
    const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
    if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      throw new ValidationError('Formato de teléfono inválido', 'phone', data.phone);
    }

    // Validación de empresa
    if (!data.company || data.company.trim().length < 2) {
      throw new CompanyDataError('Nombre de empresa requerido', 'company', 'min_length');
    }

    // Validación de nombre completo
    if (!data.fullName || data.fullName.trim().length < 2) {
      throw new ValidationError('Nombre completo requerido', 'fullName', data.fullName);
    }
  }, []);

  const submitForm = useCallback(async (rawData: any): Promise<boolean> => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Adapt data to internal format
      const data = adaptFormData(rawData);
      
      // Validar datos antes de enviar
      await validateForm(data);

      // Insertar en Supabase
      const { data: insertData, error: supabaseError } = await supabase
        .from('contact_leads')
        .insert([{
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          referral: data.referral,
          status: 'new',
          ip_address: await getClientIP(),
          user_agent: navigator.userAgent
        }])
        .select()
        .single();

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          throw new ValidationError('Este email ya está registrado', 'email', data.email);
        }
        throw new NetworkError('Error al guardar contacto', 500, { supabaseError });
      }

      // Intentar enviar a HubSpot
      try {
        await sendToHubSpot(data, insertData.id);
      } catch (hubspotError) {
        // Log del error pero no fallar el proceso principal
        const error = hubspotError as Error;
        handleHubSpotError(
          new HubSpotIntegrationError(
            'Error al enviar a HubSpot',
            error.message,
            'contacts'
          ),
          { 
            component: 'ContactForm',
            companyId: data.company,
            metadata: { contactId: insertData.id }
          }
        );
      }

      toast({
        title: "Contacto enviado",
        description: "Gracias por tu interés. Te contactaremos pronto.",
        duration: 4000,
      });

      return true;

    } catch (error) {
      if (error instanceof ValidationError) {
        const field = error.context?.field as string || 'general';
        setErrors({ [field]: error.message });
        toast({
          title: "Error de validación",
          description: error.message,
          variant: "destructive",
          duration: 4000,
        });
      } else if (error instanceof CompanyDataError) {
        const field = error.context?.dataField as string || 'company';
        setErrors({ [field]: error.message });
        handleCompanyDataError(error, { 
          component: 'ContactForm',
          companyId: rawData.company || 'unknown'
        });
      } else if (error instanceof NetworkError) {
        toast({
          title: "Error de conexión",
          description: "Error al enviar el formulario. Inténtalo de nuevo.",
          variant: "destructive",
          duration: 4000,
        });
      } else {
        toast({
          title: "Error inesperado",
          description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
          variant: "destructive",
          duration: 4000,
        });
      }

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, handleHubSpotError, handleCompanyDataError, toast]);

  return {
    isSubmitting,
    submitForm,
    validateForm,
    errors
  };
};

// Función auxiliar para obtener IP del cliente
const getClientIP = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};

// Función auxiliar para enviar a HubSpot
const sendToHubSpot = async (data: ContactFormData, contactId: string): Promise<void> => {
  try {
    const response = await fetch('/api/hubspot/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        firstname: data.fullName.split(' ')[0],
        lastname: data.fullName.split(' ').slice(1).join(' '),
        company: data.company,
        phone: data.phone,
        source: 'contact_form',
        capittal_contact_id: contactId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en HubSpot API');
    }
  } catch (error) {
    throw error;
  }
};
