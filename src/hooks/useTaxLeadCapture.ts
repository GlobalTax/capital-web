import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { taxLeadSchema, TaxLeadFormData } from '@/schemas/taxLeadSchema';
import { TaxFormData } from '@/hooks/useTaxCalculator';
import { TaxCalculationResult } from '@/utils/taxCalculation';
import { useBrevoTracking } from '@/hooks/useBrevoTracking';
import { toast } from 'sonner';

interface UseTaxLeadCaptureProps {
  taxFormData: TaxFormData;
  taxResult: TaxCalculationResult;
  onSuccess: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const useTaxLeadCapture = ({ taxFormData, taxResult, onSuccess }: UseTaxLeadCaptureProps) => {
  const [formData, setFormData] = useState<Partial<TaxLeadFormData>>({
    email: '',
    fullName: '',
    phone: '',
    company: '',
    acceptPrivacy: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaxLeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { identifyContact, trackFormSubmission } = useBrevoTracking();

  const updateField = useCallback(<K extends keyof TaxLeadFormData>(
    field: K,
    value: TaxLeadFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validate = useCallback((): boolean => {
    const result = taxLeadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TaxLeadFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof TaxLeadFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [formData]);

  const buildMessage = useCallback((): string => {
    const lines = [
      '📊 Simulación Fiscal Completada',
      '─────────────────────────────',
      `Precio de venta: ${formatCurrency(taxFormData.salePrice)}`,
      `Tipo contribuyente: ${taxFormData.taxpayerType === 'individual' ? 'Persona Física' : 'Sociedad'}`,
      `Porcentaje vendido: ${taxFormData.salePercentage}%`,
      '',
      '💰 Resultados:',
      `• Ganancia patrimonial: ${formatCurrency(taxResult.capitalGain)}`,
      `• Impuesto estimado: ${formatCurrency(taxResult.totalTax)}`,
      `• Tipo efectivo: ${taxResult.effectiveTaxRate.toFixed(2)}%`,
      `• Neto tras impuestos: ${formatCurrency(taxResult.netAfterTax)}`,
    ];

    if (taxFormData.applyArticle21 && taxResult.article21Benefit > 0) {
      lines.push('', `🏛️ Art. 21 LIS aplicado: Ahorro de ${formatCurrency(taxResult.article21Benefit)}`);
    }

    if (taxFormData.vitaliciaPlan && taxResult.vitaliciaBenefit > 0) {
      lines.push('', `🏦 Renta Vitalicia: Ahorro de ${formatCurrency(taxResult.vitaliciaBenefit)}`);
    }

    return lines.join('\n');
  }, [taxFormData, taxResult]);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!validate()) return false;

    setIsSubmitting(true);

    try {
      // Get UTM params from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      const leadData = {
        email: formData.email!.trim().toLowerCase(),
        full_name: formData.fullName?.trim() || 'Usuario Calculadora Fiscal',
        phone: formData.phone?.trim() || null,
        company: formData.company?.trim() || 'No especificada',
        service_type: 'otros' as const,
        status: 'new',
        source: 'tax_calculator',
        source_project: 'lp-calculadora-fiscal',
        message: buildMessage(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      };

      const { error } = await supabase
        .from('contact_leads')
        .insert([leadData]);

      if (error) throw error;

      // Track in Brevo
      identifyContact(leadData.email, {
        nombre: leadData.full_name,
        telefono: leadData.phone || undefined,
        empresa: leadData.company || undefined,
      });

      trackFormSubmission('tax_calculator_lead', {
        salePrice: taxFormData.salePrice,
        taxpayerType: taxFormData.taxpayerType,
        estimatedTax: taxResult.totalTax,
        hasArticle21: taxFormData.applyArticle21,
      });

      toast.success('¡Tu simulación está lista!');
      onSuccess();
      return true;
    } catch (error) {
      console.error('Error saving tax lead:', error);
      toast.error('Error al guardar tus datos. Inténtalo de nuevo.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, buildMessage, identifyContact, trackFormSubmission, taxFormData, taxResult, onSuccess]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    submit,
  };
};
