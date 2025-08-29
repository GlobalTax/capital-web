import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface FinancialDataFormProps {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
  getFieldState?: (field: string) => {
    isTouched: boolean;
    hasError: boolean;
    isValid: boolean;
    errorMessage?: string;
  };
  handleFieldBlur?: (field: string) => void;
  errors?: Record<string, string>;
}

const FinancialDataForm: React.FC<FinancialDataFormProps> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    if (handleFieldBlur) {
      handleFieldBlur(fieldName);
    }
  };

  const getValidationState = (fieldName: string) => {
    if (getFieldState) {
      return getFieldState(fieldName);
    }
    
    const isTouched = touchedFields.has(fieldName);
    const hasValue = Boolean(companyData[fieldName]);
    return {
      isTouched,
      hasError: false,
      isValid: hasValue,
      errorMessage: ''
    };
  };

  const getFieldClassName = (fieldName: string, isRequired: boolean = true) => {
    const state = getValidationState(fieldName);
    const hasValue = Boolean(companyData[fieldName]);
    
    if (!showValidation && !state.isTouched) {
      return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
    }
    
    if (state.isValid && hasValue && (state.isTouched || showValidation)) {
      return "w-full border-0.5 border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-lg px-4 py-3 pr-10";
    } else if (!state.isValid && isRequired && (showValidation || (state.isTouched && !hasValue))) {
      return "w-full border-0.5 border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg px-4 py-3";
    }
    
    return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
  };

  const shouldShowCheckIcon = (fieldName: string) => {
    const state = getValidationState(fieldName);
    const hasValue = Boolean(companyData[fieldName]);
    return state.isValid && hasValue && (state.isTouched || showValidation);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.financial_data_title')}</h2>
        <p className="text-gray-600">{t('form.financial_data_subtitle')}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Revenue */}
        <div className="h-[110px] flex flex-col">
          <Label htmlFor="revenue" className="text-sm font-medium text-gray-700">
            {t('form.revenue')} <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2 flex-1">
            <Input
              id="revenue"
              type="number"
              value={companyData.revenue || ''}
              onChange={(e) => updateField('revenue', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('revenue')}
              placeholder="1000000"
              className={getFieldClassName('revenue')}
            />
            {shouldShowCheckIcon('revenue') && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="h-[20px] mt-1 space-y-1">
            <p className="text-xs text-gray-500">
              {companyData.revenue > 0 ? `${formatCurrency(companyData.revenue)} anuales` : 'Ingresos anuales de la empresa'}
            </p>
            <p className={`text-red-500 text-sm transition-opacity duration-200 ${showValidation && errors?.revenue ? 'opacity-100' : 'opacity-0'}`}>
              {errors?.revenue || '\u00A0'}
            </p>
          </div>
        </div>

        {/* EBITDA */}
        <div className="h-[110px] flex flex-col">
          <Label htmlFor="ebitda" className="text-sm font-medium text-gray-700">
            {t('form.ebitda')} <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-2 flex-1">
            <Input
              id="ebitda"
              type="number"
              value={companyData.ebitda || ''}
              onChange={(e) => updateField('ebitda', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('ebitda')}
              placeholder="200000"
              className={getFieldClassName('ebitda')}
            />
            {shouldShowCheckIcon('ebitda') && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="h-[20px] mt-1 space-y-1">
            <p className="text-xs text-gray-500">
              {companyData.ebitda > 0 ? `${formatCurrency(companyData.ebitda)} anuales` : 'EBITDA anual de la empresa'}
            </p>
            <p className={`text-red-500 text-sm transition-opacity duration-200 ${showValidation && errors?.ebitda ? 'opacity-100' : 'opacity-0'}`}>
              {errors?.ebitda || '\u00A0'}
            </p>
          </div>
        </div>
      </div>

      {/* Adjustments Section */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasAdjustments"
            checked={companyData.hasAdjustments || false}
            onCheckedChange={(checked) => updateField('hasAdjustments', checked)}
          />
          <Label htmlFor="hasAdjustments" className="text-sm font-medium text-gray-700">
            {t('form.ebitda_adjustments')}
          </Label>
        </div>
        <p className="text-xs text-gray-500">
          {t('form.ebitda_adjustments_help')}
        </p>

        {companyData.hasAdjustments && (
          <div className="mt-4">
            <Label htmlFor="adjustmentAmount" className="text-sm font-medium text-gray-700">
              {t('form.adjustment_amount')}
            </Label>
            <div className="relative mt-2">
              <Input
                id="adjustmentAmount"
                type="number"
                value={companyData.adjustmentAmount || ''}
                onChange={(e) => updateField('adjustmentAmount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur('adjustmentAmount')}
                placeholder="50000"
                className={getFieldClassName('adjustmentAmount', false)}
              />
              {shouldShowCheckIcon('adjustmentAmount') && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {companyData.adjustmentAmount > 0 ? `${formatCurrency(companyData.adjustmentAmount)}` : 'Cantidad a ajustar al EBITDA'}
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          {t('help.financial_title')}
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• {t('help.revenue_tip')}</li>
          <li>• {t('help.ebitda_tip')}</li>
          <li>• {t('help.adjustments_tip')}</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialDataForm;