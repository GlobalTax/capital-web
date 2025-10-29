import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { useAdvisorValuationMultiples } from '@/hooks/useAdvisorValuationMultiples';
import { calculateAdvisorValuation, AdvisorValuationResult } from '@/utils/advisorValuationCalculation';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FormData {
  sector: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
}

interface AdvisorCalculatorFormProps {
  onCalculate: (data: FormData, result: AdvisorValuationResult) => void;
}

export const AdvisorCalculatorForm: React.FC<AdvisorCalculatorFormProps> = ({ onCalculate }) => {
  const { t } = useI18n();
  const { getMultipleBySector, isLoading: loadingMultiples } = useAdvisorValuationMultiples();
  
  const [formData, setFormData] = useState<FormData>({
    sector: '',
    revenue: 0,
    ebitda: 0,
    netProfit: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const validateField = (field: keyof FormData, value: number | string) => {
    const newErrors = { ...errors };
    
    if (field === 'sector') {
      if (!value) {
        newErrors.sector = t('validation.required');
      } else {
        delete newErrors.sector;
      }
    }
    
    if (field === 'revenue') {
      const numValue = Number(value);
      if (numValue <= 0) {
        newErrors.revenue = t('advisor.validation.revenue_required');
      } else if (numValue > 1_000_000_000) {
        newErrors.revenue = t('advisor.validation.revenue_too_high');
      } else {
        delete newErrors.revenue;
      }
    }
    
    if (field === 'ebitda') {
      const numValue = Number(value);
      if (numValue < 0) {
        newErrors.ebitda = t('advisor.validation.ebitda_negative');
      } else if (numValue > formData.revenue) {
        newErrors.ebitda = t('advisor.validation.ebitda_exceeds_revenue');
      } else {
        delete newErrors.ebitda;
      }
    }
    
    if (field === 'netProfit') {
      const numValue = Number(value);
      if (numValue > formData.revenue) {
        newErrors.netProfit = t('advisor.validation.netProfit_exceeds_revenue');
      } else if (numValue < -formData.revenue) {
        newErrors.netProfit = t('advisor.validation.netProfit_too_low');
      } else {
        delete newErrors.netProfit;
      }
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación final
    if (!formData.sector || formData.revenue <= 0) {
      toast.error(t('advisor.error.no_multiples'), {
        description: 'Completa todos los campos requeridos'
      });
      return;
    }
    
    if (Object.keys(errors).length > 0) {
      toast.error('Error de validación', {
        description: 'Corrige los errores antes de continuar'
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const multiples = getMultipleBySector(formData.sector);
      
      if (!multiples) {
        toast.error(t('advisor.error.no_multiples'));
        return;
      }
      
      const result = calculateAdvisorValuation(
        {
          sector: formData.sector,
          revenue: formData.revenue,
          ebitda: formData.ebitda,
          netProfit: formData.netProfit
        },
        multiples
      );
      
      onCalculate(formData, result);
      
    } catch (error) {
      console.error('Error calculating:', error);
      toast.error(t('advisor.error.calculation_failed'));
    } finally {
      setIsCalculating(false);
    }
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('advisor.form.title')}</CardTitle>
          <CardDescription>
            {t('advisor.form.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Selector de sector */}
          <div>
            <Label htmlFor="sector">{t('label.industry')}</Label>
            <SectorSelect 
              value={formData.sector}
              onChange={(value) => handleInputChange('sector', value)}
              required
              className={errors.sector ? 'border-destructive' : ''}
            />
            {errors.sector && (
              <p className="text-sm text-destructive mt-1">{errors.sector}</p>
            )}
          </div>
          
          {/* Grid de 3 columnas en desktop, stack en móvil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Facturación */}
            <div>
              <Label htmlFor="revenue">
                {t('advisor.form.revenue')} *
              </Label>
              <Input
                id="revenue"
                type="number"
                value={formData.revenue || ''}
                onChange={(e) => handleInputChange('revenue', Number(e.target.value))}
                onBlur={(e) => validateField('revenue', Number(e.target.value))}
                required
                min="0"
                step="1000"
                placeholder="1.000.000"
                className={errors.revenue ? 'border-destructive' : ''}
              />
              {errors.revenue && (
                <p className="text-sm text-destructive mt-1">{errors.revenue}</p>
              )}
            </div>
            
            {/* EBITDA */}
            <div>
              <Label htmlFor="ebitda">
                {t('advisor.form.ebitda')} *
              </Label>
              <Input
                id="ebitda"
                type="number"
                value={formData.ebitda || ''}
                onChange={(e) => handleInputChange('ebitda', Number(e.target.value))}
                onBlur={(e) => validateField('ebitda', Number(e.target.value))}
                required
                min="0"
                step="1000"
                placeholder="200.000"
                className={errors.ebitda ? 'border-destructive' : ''}
              />
              {errors.ebitda && (
                <p className="text-sm text-destructive mt-1">{errors.ebitda}</p>
              )}
            </div>
            
            {/* Resultado Neto */}
            <div>
              <Label htmlFor="netProfit">
                {t('advisor.form.netProfit')} *
              </Label>
              <Input
                id="netProfit"
                type="number"
                value={formData.netProfit || ''}
                onChange={(e) => handleInputChange('netProfit', Number(e.target.value))}
                onBlur={(e) => validateField('netProfit', Number(e.target.value))}
                required
                step="1000"
                placeholder="150.000"
                className={errors.netProfit ? 'border-destructive' : ''}
              />
              {errors.netProfit && (
                <p className="text-sm text-destructive mt-1">{errors.netProfit}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {t('advisor.form.netProfitHint')}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isCalculating || loadingMultiples || Object.keys(errors).length > 0}
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
        </CardFooter>
      </Card>
    </form>
  );
};
