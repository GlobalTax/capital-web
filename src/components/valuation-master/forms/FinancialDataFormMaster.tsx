import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
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

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isFieldValid = (fieldName: string, value: any): boolean => {
    switch (fieldName) {
      case 'revenue':
      case 'ebitda':
        return value > 0;
      default:
        return true;
    }
  };

  const getFieldClassName = (fieldName: string, value: any, baseClasses: string = '') => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, value);
    let classes = baseClasses;
    
    if ((isTouched || showValidation)) {
      if (!isValid) {
        classes += ' border-red-500 focus:border-red-500';
      } else if (isValid && value > 0) {
        classes += ' border-green-500 focus:border-green-500';
      }
    }
    
    return classes;
  };

  const shouldShowCheckIcon = (fieldName: string, value: any): boolean => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, value);
    return (isTouched || showValidation) && isValid && value > 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('steps.financial_data')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('step2.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos anuales */}
        <div className="relative">
          <Label htmlFor="revenue" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.annual_revenue')} *
          </Label>
          <div className="relative">
            <Input
              id="revenue"
              type="number"
              value={companyData.revenue || ''}
              onChange={(e) => updateField('revenue', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('revenue')}
              placeholder="500000"
              className={getFieldClassName('revenue', companyData.revenue, 'pr-10')}
              min="0"
              step="1000"
            />
            {shouldShowCheckIcon('revenue', companyData.revenue) && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {companyData.revenue > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(companyData.revenue)}
            </p>
          )}
          {(showValidation || touchedFields.has('revenue')) && !isFieldValid('revenue', companyData.revenue) && (
            <p className="text-red-600 text-sm mt-1">
              {t('validation.revenue_required')}
            </p>
          )}
        </div>

        {/* EBITDA */}
        <div className="relative">
          <Label htmlFor="ebitda" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.ebitda')} *
          </Label>
          <div className="relative">
            <Input
              id="ebitda"
              type="number"
              value={companyData.ebitda || ''}
              onChange={(e) => updateField('ebitda', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('ebitda')}
              placeholder="100000"
              className={getFieldClassName('ebitda', companyData.ebitda, 'pr-10')}
              min="0"
              step="1000"
            />
            {shouldShowCheckIcon('ebitda', companyData.ebitda) && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {companyData.ebitda > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(companyData.ebitda)}
            </p>
          )}
          {(showValidation || touchedFields.has('ebitda')) && !isFieldValid('ebitda', companyData.ebitda) && (
            <p className="text-red-600 text-sm mt-1">
              {t('validation.ebitda_required')}
            </p>
          )}
        </div>
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
        <Label className="text-sm font-medium text-gray-700">
          {t('fields.ebitda_adjustments')}
        </Label>
        
        <RadioGroup
          value={companyData.hasAdjustments ? 'yes' : 'no'}
          onValueChange={(value) => updateField('hasAdjustments', value === 'yes')}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no-adjustments" />
            <Label htmlFor="no-adjustments" className="text-sm text-gray-700">
              {t('no')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="yes-adjustments" />
            <Label htmlFor="yes-adjustments" className="text-sm text-gray-700">
              {t('yes')}
            </Label>
          </div>
        </RadioGroup>

        {companyData.hasAdjustments && (
          <div className="relative mt-4">
            <Label htmlFor="adjustmentAmount" className="text-sm font-medium text-gray-700 mb-2 block">
              {t('fields.adjustment_amount')}
            </Label>
            <div className="relative">
              <Input
                id="adjustmentAmount"
                type="number"
                value={companyData.adjustmentAmount || ''}
                onChange={(e) => updateField('adjustmentAmount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleBlur('adjustmentAmount')}
                placeholder="10000"
                className="pr-10"
                min="0"
                step="1000"
              />
            </div>
            {companyData.adjustmentAmount > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(companyData.adjustmentAmount)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {t('adjustment.help')}
            </p>
          </div>
        )}
      </div>

      {/* Texto informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {t('step2.info')}
        </p>
      </div>
    </div>
  );
};

export default FinancialDataFormMaster;