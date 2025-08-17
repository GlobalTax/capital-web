
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { normalizePhoneToE164 } from '@/utils/phoneUtils';

interface BasicInfoFormProps {
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

const industries = [
  'Tecnología y Software',
  'Servicios Financieros',
  'Retail y Consumer',
  'Industrial y Manufactura',
  'Energía y Renovables',
  'Real Estate',
  'Healthcare y Biotecnología',
  'Consultoría y Servicios Profesionales',
  'Educación',
  'Media y Entretenimiento',
  'Transporte y Logística',
  'Telecomunicaciones',
  'Alimentación y Bebidas',
  'Turismo y Hostelería',
  'Otros'
];

const employeeRanges = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-100', label: '51-100 empleados' },
  { value: '101-250', label: '101-250 empleados' },
  { value: '251-500', label: '251-500 empleados' },
  { value: '501+', label: 'Más de 500 empleados' }
];

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Financial data formatting functions
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const isFieldValid = (field: string, value: any): boolean => {
    switch (field) {
      case 'revenue':
      case 'ebitda':
        return value > 0;
      default:
        return Boolean(value);
    }
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

  const employeeRangeKey = (value: string) => {
    switch (value) {
      case '1-10': return 'employees.1_10';
      case '11-50': return 'employees.11_50';
      case '51-100': return 'employees.51_100';
      case '101-250': return 'employees.101_250';
      case '251-500': return 'employees.251_500';
      default: return 'employees.501_plus';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.basic.title')}</h2>
        <p className="text-gray-600">{t('form.basic.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre de contacto */}
        <div className="relative">
          <Label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.contactName')}
          </Label>
          <Input
            id="contactName"
            name="contactName"
            type="text"
            autoComplete="name"
            value={companyData.contactName}
            onChange={(e) => updateField('contactName', e.target.value)}
            onBlur={() => handleBlur('contactName')}
            placeholder={t('placeholder.contactName')}
            className={getFieldClassName('contactName')}
          />
          {shouldShowCheckIcon('contactName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && errors?.contactName && (
            <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>
          )}
        </div>

        {/* Nombre de la empresa */}
        <div className="relative">
          <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.companyName')}
          </Label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            autoComplete="organization"
            value={companyData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            onBlur={() => handleBlur('companyName')}
            placeholder={t('placeholder.companyName')}
            className={getFieldClassName('companyName')}
          />
          {shouldShowCheckIcon('companyName') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && errors?.companyName && (
            <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={companyData.email}
            onChange={(e) => updateField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={t('placeholder.email')}
            className={getFieldClassName('email')}
          />
          {shouldShowCheckIcon('email') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {showValidation && errors?.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Teléfono (WhatsApp) */}
        <div className="relative">
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (WhatsApp)
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={companyData.phone}
            onChange={(e) => {
              const value = e.target.value;
              updateField('phone', value);
              
              // Normalizar a E.164 automáticamente
              const normalizedPhone = normalizePhoneToE164(value);
              if (normalizedPhone) {
                updateField('phone_e164', normalizedPhone);
              }
            }}
            onBlur={() => handleBlur('phone')}
            placeholder="612 345 678"
            className={getFieldClassName('phone', false)}
          />
          {shouldShowCheckIcon('phone') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          {companyData.phone_e164 && (
            <p className="text-xs text-gray-500 mt-1">
              Formato internacional: {companyData.phone_e164}
            </p>
          )}
        </div>

        {/* Consentimiento WhatsApp */}
        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="whatsapp_opt_in"
            checked={companyData.whatsapp_opt_in}
            onCheckedChange={(checked) => {
              updateField('whatsapp_opt_in', Boolean(checked));
            }}
            className="mt-0.5"
          />
          <Label 
            htmlFor="whatsapp_opt_in" 
            className="text-sm text-gray-600 leading-5"
          >
            Usaremos tu número solo para enviarte el resultado por WhatsApp. Puedes darte de baja en cualquier momento.
          </Label>
        </div>

        {/* CIF */}
        <div className="relative">
          <Label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.cif')}
          </Label>
          <Input
            id="cif"
            name="cif"
            type="text"
            value={companyData.cif}
            onChange={(e) => updateField('cif', e.target.value)}
            onBlur={() => handleBlur('cif')}
            placeholder={t('placeholder.cif')}
            className={getFieldClassName('cif', false)}
          />
          {shouldShowCheckIcon('cif') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
        </div>

        {/* Sector */}
        <div className="relative">
          <Label htmlFor="industry-select" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.industry')}
          </Label>
          <Select
            value={companyData.industry}
            onValueChange={(value) => {
              updateField('industry', value);
              handleBlur('industry');
            }}
          >
            <SelectTrigger 
              id="industry-select"
              name="industry"
              className={getFieldClassName('industry')}
            >
              <SelectValue placeholder={t('placeholder.industry')} />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry} className="hover:bg-gray-100">
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowCheckIcon('industry') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {showValidation && errors?.industry && (
            <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
          )}
        </div>

        {/* Descripción de actividad */}
        <div className="relative">
          <Label htmlFor="activityDescription" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.activityDescription')}
          </Label>
          <Input
            id="activityDescription"
            name="activityDescription"
            type="text"
            value={companyData.activityDescription}
            onChange={(e) => updateField('activityDescription', e.target.value)}
            onBlur={() => handleBlur('activityDescription')}
            placeholder={t('placeholder.activityDescription')}
            className={getFieldClassName('activityDescription')}
          />
          {shouldShowCheckIcon('activityDescription') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">{t('helper.activityDescription')}</p>
          {showValidation && errors?.activityDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.activityDescription}</p>
          )}
        </div>

        {/* Ubicación */}
        <div className="relative">
          <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.location')}
          </Label>
          <Input
            id="location"
            name="location"
            type="text"
            value={companyData.location}
            onChange={(e) => updateField('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            placeholder={t('placeholder.location')}
            className={getFieldClassName('location')}
          />
          {shouldShowCheckIcon('location') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">{t('helper.location')}</p>
          {showValidation && errors?.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Rango de empleados */}
        <div className="relative">
          <Label htmlFor="employeeRange-select" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.employeeRange')}
          </Label>
          <Select
            value={companyData.employeeRange}
            onValueChange={(value) => {
              updateField('employeeRange', value);
              handleBlur('employeeRange');
            }}
          >
            <SelectTrigger 
              id="employeeRange-select"
              name="employeeRange"
              className={getFieldClassName('employeeRange')}
            >
              <SelectValue placeholder={t('placeholder.employeeRange')} />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border border-gray-200 z-50">
              {employeeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value} className="hover:bg-gray-100">
                  {t(employeeRangeKey(range.value))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowCheckIcon('employeeRange') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {showValidation && errors?.employeeRange && (
            <p className="text-red-500 text-sm mt-1">{errors.employeeRange}</p>
          )}
        </div>
      </div>

      {/* Financial Data Section */}
      <div className="space-y-6 mt-8 pt-8 border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('form.financial_data_title')}
          </h3>
          <p className="text-sm text-gray-600">
            {t('form.financial_data_subtitle')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Revenue */}
          <div className="space-y-2">
            <Label htmlFor="revenue" className="text-sm font-medium text-gray-700">
              {t('form.revenue')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="revenue"
                type="number"
                placeholder="500000"
                value={companyData.revenue || ''}
                onChange={(e) => updateField('revenue', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('revenue')}
                className={getFieldClassName('revenue')}
                min="0"
                step="1000"
              />
              {shouldShowCheckIcon('revenue') && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {companyData.revenue > 0 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(companyData.revenue)}
              </p>
            )}
            {showValidation && !isFieldValid('revenue', companyData.revenue) && (
              <p className="text-sm text-red-600">{t('validation.revenue_required')}</p>
            )}
          </div>

          {/* EBITDA */}
          <div className="space-y-2">
            <Label htmlFor="ebitda" className="text-sm font-medium text-gray-700">
              {t('form.ebitda')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="ebitda"
                type="number"
                placeholder="75000"
                value={companyData.ebitda || ''}
                onChange={(e) => updateField('ebitda', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('ebitda')}
                className={getFieldClassName('ebitda')}
                min="0"
                step="1000"
              />
              {shouldShowCheckIcon('ebitda') && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
            {companyData.ebitda > 0 && (
              <p className="text-xs text-gray-500">
                {formatCurrency(companyData.ebitda)}
              </p>
            )}
            {showValidation && !isFieldValid('ebitda', companyData.ebitda) && (
              <p className="text-sm text-red-600">{t('validation.ebitda_required')}</p>
            )}
          </div>
        </div>

        {/* Adjustments */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-700">
            {t('form.has_adjustments')}
          </Label>
          <RadioGroup
            value={companyData.hasAdjustments ? 'yes' : 'no'}
            onValueChange={(value) => updateField('hasAdjustments', value === 'yes')}
            className="flex flex-row space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no-adjustments" />
              <Label htmlFor="no-adjustments" className="text-sm text-gray-700">
                {t('form.no')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes-adjustments" />
              <Label htmlFor="yes-adjustments" className="text-sm text-gray-700">
                {t('form.yes')}
              </Label>
            </div>
          </RadioGroup>

          {companyData.hasAdjustments && (
            <div className="space-y-2">
              <Label htmlFor="adjustmentAmount" className="text-sm font-medium text-gray-700">
                {t('form.adjustment_amount')}
              </Label>
              <div className="relative">
                <Input
                  id="adjustmentAmount"
                  type="number"
                  placeholder="15000"
                  value={companyData.adjustmentAmount || ''}
                  onChange={(e) => updateField('adjustmentAmount', parseInt(e.target.value) || 0)}
                  onBlur={() => handleBlur('adjustmentAmount')}
                  className={getFieldClassName('adjustmentAmount', false)}
                  min="0"
                  step="1000"
                />
                {shouldShowCheckIcon('adjustmentAmount') && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
              </div>
              {companyData.adjustmentAmount > 0 && (
                <p className="text-xs text-gray-500">
                  {formatCurrency(companyData.adjustmentAmount)}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{t('form.financial_info_title')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {t('form.financial_info_revenue')}</li>
            <li>• {t('form.financial_info_ebitda')}</li>
            <li>• {t('form.financial_info_adjustments')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;
