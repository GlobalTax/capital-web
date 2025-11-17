import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FirmTypeSelect } from './FirmTypeSelect';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { useAdvisorRevenueMultiplesByRange } from '@/hooks/useAdvisorRevenueMultiplesByRange';
import { useAdvisorEbitdaMultiplesByRange } from '@/hooks/useAdvisorEbitdaMultiplesByRange';
import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getIPAddress } from '@/utils/getIPAddress';
import { formatNumberWithDots, parseNumberWithDots } from '@/utils/numberFormatting';

interface AdvisorStepperFormProps {
  onCalculate: (data: AdvisorFormData, result: AdvisorValuationSimpleResult, valuationId?: string) => void;
}

export const AdvisorStepperForm: React.FC<AdvisorStepperFormProps> = ({ onCalculate }) => {
  const { t } = useI18n();
  const { getMultipleForValue: getRevenueMultiple } = useAdvisorRevenueMultiplesByRange();
  const { getMultipleForValue: getEbitdaMultiple } = useAdvisorEbitdaMultiplesByRange();
  const [isCalculating, setIsCalculating] = useState(false);

  const [formData, setFormData] = useState<AdvisorFormData>({
    contactName: '',
    email: '',
    phone: '',
    phone_e164: '',
    whatsapp_opt_in: false,
    companyName: '',
    cif: '',
    firmType: '',
    employeeRange: '',
    revenue: 0,
    ebitda: 0,
  });

  const [displayValues, setDisplayValues] = useState({
    revenue: '',
    ebitda: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof AdvisorFormData, value: any) => {
    if (field === 'revenue' || field === 'ebitda') {
      const numValue = typeof value === 'string' ? parseNumberWithDots(value) : value;
      setFormData(prev => ({ ...prev, [field]: numValue }));
      setDisplayValues(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar contacto
    if (!formData.contactName.trim()) {
      newErrors.contactName = t('validation.required');
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = t('validation.required');
    }
    if (!formData.phone_e164) {
      newErrors.phone = t('validation.required');
    }

    // Validar empresa
    if (!formData.companyName.trim()) {
      newErrors.companyName = t('validation.required');
    }
    if (!formData.cif.trim()) {
      newErrors.cif = t('validation.required');
    }
    if (!formData.firmType) {
      newErrors.firmType = t('validation.required');
    }
    if (!formData.employeeRange) {
      newErrors.employeeRange = t('validation.required');
    }

    // Validar financiero
    if (formData.revenue <= 0) {
      newErrors.revenue = t('validation.required');
    }
    if (formData.ebitda <= 0) {
      newErrors.ebitda = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = async () => {
    if (!validateForm()) {
      toast.error(t('validation.error_title'), {
        description: t('validation.fix_errors')
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Mapear todos los firmTypes al sector genérico en la BD
      const ADVISOR_SECTOR = 'Asesorías Profesionales';
      
      // Obtener múltiplos por rangos de EBITDA y Revenue
      let revenueMultiple = getRevenueMultiple(ADVISOR_SECTOR, formData.revenue);
      let ebitdaMultiple = getEbitdaMultiple(ADVISOR_SECTOR, formData.ebitda);

      // Valores por defecto si no hay múltiplos en la base de datos
      const DEFAULT_REVENUE_MULTIPLE = 0.8;
      const DEFAULT_EBITDA_MULTIPLE = 5.0;

      if (!revenueMultiple) {
        console.warn('No revenue multiple found, using default:', DEFAULT_REVENUE_MULTIPLE);
        revenueMultiple = DEFAULT_REVENUE_MULTIPLE;
      }

      if (!ebitdaMultiple) {
        console.warn('No EBITDA multiple found, using default:', DEFAULT_EBITDA_MULTIPLE);
        ebitdaMultiple = DEFAULT_EBITDA_MULTIPLE;
      }

      // Cálculo SEPARADO por EBITDA
      const ebitdaValuation = formData.ebitda * ebitdaMultiple;
      const ebitdaRange = {
        min: ebitdaValuation * 0.85,
        max: ebitdaValuation * 1.15,
      };

      // Cálculo SEPARADO por Facturación
      const revenueValuation = formData.revenue * revenueMultiple;
      const revenueRange = {
        min: revenueValuation * 0.85,
        max: revenueValuation * 1.15,
      };

      const result: AdvisorValuationSimpleResult = {
        // Valoraciones separadas
        ebitdaValuation,
        ebitdaMultiple,
        ebitdaRange,
        
        revenueValuation,
        revenueMultiple,
        revenueRange,
        
        // Mantener para compatibilidad (usar EBITDA como principal)
        finalValuation: ebitdaValuation,
        valuationRange: ebitdaRange,
        
        sector: formData.firmType,
      };

      console.info('Valuation calculated:', {
        sector: formData.firmType,
        revenue: formData.revenue,
        ebitda: formData.ebitda,
        revenueMultiple,
        ebitdaMultiple,
        ebitdaValuation,
        revenueValuation
      });

      // 🆕 GUARDAR EN BASE DE DATOS INMEDIATAMENTE
      const ipAddress = await getIPAddress();
      const { data: savedValuation, error: dbError } = await supabase
        .from('advisor_valuations')
        .insert({
          // Datos de contacto
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          phone_e164: formData.phone_e164,
          whatsapp_opt_in: formData.whatsapp_opt_in,
          
          // Datos de empresa
          company_name: formData.companyName,
          cif: formData.cif,
          firm_type: formData.firmType,
          employee_range: formData.employeeRange,
          
          // Datos financieros
          revenue: formData.revenue,
          ebitda: formData.ebitda,
          
          // Resultados de valoración
          ebitda_valuation: result.ebitdaValuation,
          ebitda_multiple: result.ebitdaMultiple,
          ebitda_range_min: result.ebitdaRange.min,
          ebitda_range_max: result.ebitdaRange.max,
          revenue_valuation: result.revenueValuation,
          revenue_multiple: result.revenueMultiple,
          revenue_range_min: result.revenueRange.min,
          revenue_range_max: result.revenueRange.max,
          final_valuation: result.finalValuation,
          
          // Metadata
          source: 'lp-calculadora-asesores',
          ip_address: ipAddress,
          user_agent: navigator.userAgent,
          email_sent: false,
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Error saving valuation:', dbError);
        // Continuar mostrando resultados aunque falle el guardado
      } else {
        console.log('✅ Valuation saved with ID:', savedValuation.id);
        
        // 📧 ENVIAR EMAIL AUTOMÁTICAMENTE
        if (savedValuation?.id) {
          console.log('📧 Enviando email automático para valoración:', savedValuation.id);
          
          supabase.functions.invoke('send-valuation-email', {
            body: {
              recipientEmail: formData.email,
              companyData: {
                contactName: formData.contactName,
                companyName: formData.companyName,
                cif: formData.cif,
                email: formData.email,
                phone: formData.phone,
                industry: formData.firmType,
                employeeRange: formData.employeeRange,
                revenue: formData.revenue,
                ebitda: formData.ebitda,
              },
              result: {
                ebitdaMultiple: result.ebitdaMultiple,
                finalValuation: result.ebitdaValuation,
                valuationRange: result.ebitdaRange,
                multiples: {
                  ebitdaMultipleUsed: result.ebitdaMultiple,
                  revenueMultipleUsed: result.revenueMultiple,
                },
                revenueValuation: result.revenueValuation,
                revenueRange: result.revenueRange,
              },
              enlaces: {
                escenariosUrl: `${window.location.origin}/lp/calculadora`,
                calculadoraFiscalUrl: `${window.location.origin}/lp/calculadora-fiscal`,
              },
              lang: 'es',
              source: 'advisor',
            },
          }).then(({ data, error }) => {
            if (error) {
              console.error('❌ Error enviando email automático:', error);
            } else {
              console.log('✅ Email automático enviado:', data);
              
              // Actualizar registro en BD
              supabase.from('advisor_valuations')
                .update({
                  email_sent: true,
                  email_sent_at: new Date().toISOString(),
                })
                .eq('id', savedValuation.id)
                .then(({ error: updateError }) => {
                  if (updateError) {
                    console.error('❌ Error actualizando email_sent:', updateError);
                  } else {
                    console.log('✅ Estado email_sent actualizado en BD');
                  }
                });
            }
          });
        }
      }

      // Simular delay para mostrar loading
      setTimeout(() => {
        setIsCalculating(false);
        onCalculate(formData, result, savedValuation?.id);
      }, 800);

    } catch (error) {
      console.error('Error calculating valuation:', error);
      toast.error(t('advisor.error.calculation'));
      setIsCalculating(false);
    }
  };

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        {/* Sección: Datos de contacto */}
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('advisor.form.contact_section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactName">{t('form.contact_name')} *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange('contactName', e.target.value)}
                placeholder={t('placeholder.contact_name')}
                className={errors.contactName ? 'border-destructive' : ''}
              />
              {errors.contactName && (
                <p className="text-sm text-destructive mt-1">{errors.contactName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">{t('form.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder={t('placeholder.email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="phone">{t('form.phone')} *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  handleInputChange('phone', value);
                  handleInputChange('phone_e164', value); // Simplified version
                }}
                placeholder={t('placeholder.phone')}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={formData.whatsapp_opt_in}
                  onCheckedChange={(checked) => handleInputChange('whatsapp_opt_in', checked)}
                />
                <Label htmlFor="whatsapp" className="text-sm font-normal">
                  {t('form.whatsapp_opt_in')}
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos de la empresa */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t('advisor.form.company_section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">{t('form.company_name')} *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder={t('placeholder.company_name')}
                className={errors.companyName ? 'border-destructive' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cif">{t('form.cif')} *</Label>
              <Input
                id="cif"
                value={formData.cif}
                onChange={(e) => handleInputChange('cif', e.target.value.toUpperCase())}
                placeholder={t('placeholder.cif')}
                className={errors.cif ? 'border-destructive' : ''}
              />
              {errors.cif && (
                <p className="text-sm text-destructive mt-1">{errors.cif}</p>
              )}
            </div>

            <div>
              <FirmTypeSelect
                value={formData.firmType}
                onChange={(value) => handleInputChange('firmType', value)}
                error={errors.firmType}
              />
            </div>

            <div>
              <Label htmlFor="employeeRange">{t('form.employee_range')} *</Label>
              <Select
                value={formData.employeeRange}
                onValueChange={(value) => handleInputChange('employeeRange', value)}
              >
                <SelectTrigger className={errors.employeeRange ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('placeholder.employeeRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">{t('employees.1_10')}</SelectItem>
                  <SelectItem value="11-50">{t('employees.11_50')}</SelectItem>
                  <SelectItem value="51-100">{t('employees.51_100')}</SelectItem>
                  <SelectItem value="101-250">{t('employees.101_250')}</SelectItem>
                  <SelectItem value="251-500">{t('employees.251_500')}</SelectItem>
                  <SelectItem value="501+">{t('employees.501_plus')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.employeeRange && (
                <p className="text-sm text-destructive mt-1">{errors.employeeRange}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Datos financieros */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">{t('advisor.form.financial_section')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">{t('form.revenue')} *</Label>
              <Input
                id="revenue"
                type="text"
                value={displayValues.revenue}
                onChange={(e) => handleInputChange('revenue', e.target.value)}
                onBlur={() => {
                  setDisplayValues(prev => ({ 
                    ...prev, 
                    revenue: formatNumberWithDots(formData.revenue) 
                  }));
                }}
                placeholder="1.000.000"
                className={errors.revenue ? 'border-destructive' : ''}
              />
              {errors.revenue && (
                <p className="text-sm text-destructive mt-1">{errors.revenue}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ebitda">{t('form.ebitda')} *</Label>
              <Input
                id="ebitda"
                type="text"
                value={displayValues.ebitda}
                onChange={(e) => handleInputChange('ebitda', e.target.value)}
                onBlur={() => {
                  setDisplayValues(prev => ({ 
                    ...prev, 
                    ebitda: formatNumberWithDots(formData.ebitda) 
                  }));
                }}
                placeholder="200.000"
                className={errors.ebitda ? 'border-destructive' : ''}
              />
              {errors.ebitda && (
                <p className="text-sm text-destructive mt-1">{errors.ebitda}</p>
              )}
            </div>
          </div>
        </div>

        {/* Botón de cálculo */}
        <div className="pt-4">
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('advisor.form.calculating')}
              </>
            ) : (
              t('advisor.form.calculate')
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
