import React, { useState, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import FormField from '@/components/ui/form-field';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface FinancialDataFormMasterProps {
  companyData: any;
  updateField: (field: string, value: string | number | boolean) => void;
  showValidation?: boolean;
}

const FinancialDataFormMaster: React.FC<FinancialDataFormMasterProps> = ({
  companyData,
  updateField,
  showValidation = false
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const isFieldValid = useCallback((fieldName: string, value: any): boolean => {
    switch (fieldName) {
      case 'revenue':
      case 'ebitda':
        return value > 0;
      default:
        return true;
    }
  }, []);

  const getValidationState = useCallback((fieldName: string, value: any) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, value);
    const hasError = (isTouched || showValidation) && !isValid;
    
    return {
      isTouched,
      hasError,
      isValid: isValid && value > 0,
      errorMessage: hasError ? t('validation.revenue_required') : undefined
    };
  }, [touchedFields, showValidation, isFieldValid, t]);

  return (
    <div className="stable-form-container">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('steps.financial_data')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('step2.subtitle')}
        </p>
      </div>

      <div className="stable-grid">
        <FormField
          id="revenue"
          label={t('fields.annual_revenue')}
          type="number"
          value={companyData.revenue || 0}
          onChange={(value) => updateField('revenue', Number(value) || 0)}
          onBlur={() => handleBlur('revenue')}
          placeholder="500000"
          required
          min={0}
          step={1000}
          error={getValidationState('revenue', companyData.revenue).errorMessage}
          isValid={getValidationState('revenue', companyData.revenue).isValid}
          isTouched={getValidationState('revenue', companyData.revenue).isTouched}
          showValidation={showValidation}
          help={companyData.revenue > 0 ? formatCurrency(companyData.revenue) : undefined}
        />

        <FormField
          id="ebitda"
          label={t('fields.ebitda')}
          type="number"
          value={companyData.ebitda || 0}
          onChange={(value) => updateField('ebitda', Number(value) || 0)}
          onBlur={() => handleBlur('ebitda')}
          placeholder="100000"
          required
          min={0}
          step={1000}
          error={getValidationState('ebitda', companyData.ebitda).errorMessage}
          isValid={getValidationState('ebitda', companyData.ebitda).isValid}
          isTouched={getValidationState('ebitda', companyData.ebitda).isTouched}
          showValidation={showValidation}
          help={companyData.ebitda > 0 ? formatCurrency(companyData.ebitda) : undefined}
        />
      </div>

      {/* Ayuda con EBITDA */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          {t('ebitda.help.title')}
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          {t('ebitda.help.formula')}
        </p>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>{t('ebitda.help.earnings')}:</strong> {t('ebitda.help.earnings_desc')}</p>
          <p>• <strong>{t('ebitda.help.before')}:</strong> {t('ebitda.help.before_desc')}</p>
        </div>
      </div>

      {/* Ajustes al EBITDA */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-foreground">
          {t('fields.ebitda_adjustments')}
        </Label>
        
        <RadioGroup
          value={companyData.hasAdjustments ? 'yes' : 'no'}
          onValueChange={(value) => updateField('hasAdjustments', value === 'yes')}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no-adjustments" />
            <Label htmlFor="no-adjustments" className="text-sm text-foreground">
              {t('no')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes-adjustments" />
            <Label htmlFor="yes-adjustments" className="text-sm text-foreground">
              {t('yes')}
            </Label>
          </div>
        </RadioGroup>

        {companyData.hasAdjustments && (
          <FormField
            id="adjustmentAmount"
            label={t('fields.adjustment_amount')}
            type="number"
            value={companyData.adjustmentAmount || 0}
            onChange={(value) => updateField('adjustmentAmount', Number(value) || 0)}
            onBlur={() => handleBlur('adjustmentAmount')}
            placeholder="10000"
            min={0}
            step={1000}
            help={`${t('adjustment.help')}${companyData.adjustmentAmount > 0 ? ` - ${formatCurrency(companyData.adjustmentAmount)}` : ''}`}
          />
        )}
      </div>

      {/* Texto informativo */}
      <div className="bg-accent border border-border rounded-lg p-4">
        <p className="text-sm text-accent-foreground">
          {t('step2.info')}
        </p>
      </div>
    </div>
  );
};

export default FinancialDataFormMaster;