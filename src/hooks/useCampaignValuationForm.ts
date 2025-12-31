import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { optimizedSupabase } from '@/integrations/supabase/optimizedClient';
import { campaignValuationSchema, CampaignValuationData } from '@/schemas/campaignValuationSchema';

interface FormState {
  email: string;
  phone: string;
  cif: string;
  revenue: string;
  ebitda: string;
  website: string; // Honeypot
}

interface FormErrors {
  email?: string;
  phone?: string;
  cif?: string;
  revenue?: string;
  ebitda?: string;
}

export function useCampaignValuationForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormState>({
    email: '',
    phone: '',
    cif: '',
    revenue: '',
    ebitda: '',
    website: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Parse numeric values
    const revenueNum = parseFloat(formData.revenue.replace(/[^0-9.-]/g, ''));
    const ebitdaNum = parseFloat(formData.ebitda.replace(/[^0-9.-]/g, ''));

    const result = campaignValuationSchema.safeParse({
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      cif: formData.cif.trim().toUpperCase(),
      revenue: isNaN(revenueNum) ? undefined : revenueNum,
      ebitda: isNaN(ebitdaNum) ? undefined : ebitdaNum,
      website: formData.website,
    });

    if (!result.success) {
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        if (field) {
          newErrors[field] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const submitForm = async () => {
    // Honeypot check
    if (formData.website) {
      console.log('Bot detected');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const revenueNum = parseFloat(formData.revenue.replace(/[^0-9.-]/g, ''));
      const ebitdaNum = parseFloat(formData.ebitda.replace(/[^0-9.-]/g, ''));

      // Collect UTM params
      const utmSource = searchParams.get('utm_source') || 'direct';
      const utmMedium = searchParams.get('utm_medium') || null;
      const utmCampaign = searchParams.get('utm_campaign') || null;
      const utmContent = searchParams.get('utm_content') || null;

      // Insert into general_contact_leads with campaign-specific data
      const phoneValue = formData.phone.trim() || null;
      const { data: insertedData, error } = await optimizedSupabase.from('general_contact_leads').insert({
        full_name: 'Pendiente',
        email: formData.email.trim().toLowerCase(),
        phone: phoneValue,
        company: `CIF: ${formData.cif.trim().toUpperCase()}`,
        message: `Campaña Valoración Cierre de Año 2025\n\nCIF: ${formData.cif.trim().toUpperCase()}\nFacturación 2025: ${revenueNum.toLocaleString('es-ES')} €\nEBITDA 2025: ${ebitdaNum.toLocaleString('es-ES')} €${phoneValue ? `\nTeléfono: ${phoneValue}` : ''}`,
        page_origin: 'valoracion_cierre_2025',
        inquiry_type: 'valoracion_campana',
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        referrer: document.referrer || null,
        status: 'new',
        priority: 'high',
      }).select('id').single();

      if (error) {
        console.error('Error submitting form:', error);
        toast({
          title: 'Error al enviar',
          description: 'Por favor, inténtalo de nuevo más tarde.',
          variant: 'destructive',
        });
        return;
      }

      // Send notification email to team (non-blocking)
      if (insertedData?.id) {
        optimizedSupabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: insertedData.id,
            formType: 'campaign_valuation',
            email: formData.email.trim().toLowerCase(),
            fullName: 'Pendiente',
            formData: {
              cif: formData.cif.trim().toUpperCase(),
              phone: phoneValue,
              revenue: revenueNum,
              ebitda: ebitdaNum,
              campaign: 'valoracion_cierre_2025',
              utmSource,
              utmMedium,
              utmCampaign,
              utmContent,
            }
          }
        }).catch((err) => console.error('Error sending notification:', err));
      }

      toast({
        title: '¡Solicitud enviada!',
        description: 'Nos pondremos en contacto contigo pronto.',
      });

      // Redirect to thank you page
      navigate('/lp/valoracion-2026/gracias');
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    updateField,
    submitForm,
  };
}
