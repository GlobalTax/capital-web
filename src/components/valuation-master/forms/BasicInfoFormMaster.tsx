import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { normalizeToE164 } from '@/utils/phoneUtils';

interface BasicInfoFormMasterProps {
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
  'agricultura',
  'servicios',
  'tecnologia',
  'servicios-profesionales',
  'e-commerce',
  'energia',
  'retail',
  'industrial',
  'healthcare',
  'construccion',
  'hosteleria',
  'inmobiliario',
  'educacion',
  'automocion',
  'telecomunicaciones',
  'otros'
];

const employeeRanges = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '201-500', label: '201-500 empleados' },
  { value: '500+', label: 'Más de 500 empleados' }
];

const BasicInfoFormMaster: React.FC<BasicInfoFormMasterProps> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

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
    
    // Fallback validation
    const isTouched = touchedFields.has(fieldName);
    const hasError = errors && errors[fieldName];
    const isValid = isTouched && !hasError && companyData[fieldName];
    
    return {
      isTouched,
      hasError: Boolean(hasError),
      isValid: Boolean(isValid),
      errorMessage: hasError ? errors[fieldName] : undefined
    };
  };

  const getFieldClassName = (fieldName: string, baseClasses: string = '') => {
    const validation = getValidationState(fieldName);
    let classes = baseClasses;
    
    if (validation.isTouched || showValidation) {
      if (validation.hasError) {
        classes += ' border-red-500 focus:border-red-500';
      } else if (validation.isValid) {
        classes += ' border-green-500 focus:border-green-500';
      }
    }
    
    return classes;
  };

  const shouldShowCheckIcon = (fieldName: string) => {
    const validation = getValidationState(fieldName);
    return (validation.isTouched || showValidation) && validation.isValid;
  };

  const employeeRangeKey = (value: string) => {
    const keyMap: { [key: string]: string } = {
      '1-10': '1_10',
      '11-50': '11_50',
      '51-200': '51_200',
      '201-500': '201_500',
      '500+': '501_plus'
    };
    return keyMap[value] || value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('steps.basic_info')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('step1.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre de contacto */}
        <div className="relative">
          <Label htmlFor="contactName" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.contact')} *
          </Label>
          <div className="relative">
            <Input
              id="contactName"
              type="text"
              value={companyData.contactName}
              onChange={(e) => updateField('contactName', e.target.value)}
              onBlur={() => handleBlur('contactName')}
              placeholder={t('placeholders.contact')}
              className={getFieldClassName('contactName', 'pr-10')}
              aria-describedby="contactName-error"
            />
            {shouldShowCheckIcon('contactName') && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {(showValidation || getValidationState('contactName').isTouched) && getValidationState('contactName').hasError && (
            <p id="contactName-error" className="text-red-600 text-sm mt-1">
              {getValidationState('contactName').errorMessage}
            </p>
          )}
        </div>

        {/* Nombre de la empresa */}
        <div className="relative">
          <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.company')} *
          </Label>
          <div className="relative">
            <Input
              id="companyName"
              type="text"
              value={companyData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              onBlur={() => handleBlur('companyName')}
              placeholder={t('placeholders.company')}
              className={getFieldClassName('companyName', 'pr-10')}
              aria-describedby="companyName-error"
            />
            {shouldShowCheckIcon('companyName') && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {(showValidation || getValidationState('companyName').isTouched) && getValidationState('companyName').hasError && (
            <p id="companyName-error" className="text-red-600 text-sm mt-1">
              {getValidationState('companyName').errorMessage}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="relative">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.email')} *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={companyData.email}
              onChange={(e) => updateField('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder={t('placeholders.email')}
              className={getFieldClassName('email', 'pr-10')}
              aria-describedby="email-error"
            />
            {shouldShowCheckIcon('email') && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {(showValidation || getValidationState('email').isTouched) && getValidationState('email').hasError && (
            <p id="email-error" className="text-red-600 text-sm mt-1">
              {getValidationState('email').errorMessage}
            </p>
          )}
        </div>

        {/* Teléfono */}
        <div className="relative">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.phone')} *
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={companyData.phone}
              onChange={(e) => {
                const value = e.target.value;
                updateField('phone', value);
                
                // Normalizar a E.164 automáticamente
                const normalizedPhone = normalizeToE164(value, 'ES');
                if (normalizedPhone) {
                  updateField('phone_e164', normalizedPhone);
                }
              }}
              onBlur={() => handleBlur('phone')}
              placeholder={t('placeholders.phone')}
              className={getFieldClassName('phone', 'pr-10')}
              aria-describedby="phone-error"
            />
            {shouldShowCheckIcon('phone') && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {companyData.phone_e164 && (
            <p className="text-xs text-gray-500 mt-1">
              Formato internacional: {companyData.phone_e164}
            </p>
          )}
          {(showValidation || getValidationState('phone').isTouched) && getValidationState('phone').hasError && (
            <p id="phone-error" className="text-red-600 text-sm mt-1">
              {getValidationState('phone').errorMessage}
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
          <Label htmlFor="cif" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.cif')}
            <span className="text-gray-500 text-xs ml-2">({t('optional')})</span>
          </Label>
          <div className="relative">
            <Input
              id="cif"
              type="text"
              value={companyData.cif}
              onChange={(e) => updateField('cif', e.target.value.toUpperCase())}
              onBlur={() => handleBlur('cif')}
              placeholder={t('placeholders.cif')}
              className={getFieldClassName('cif', 'pr-10')}
              aria-describedby="cif-error"
            />
            {shouldShowCheckIcon('cif') && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {(showValidation || getValidationState('cif').isTouched) && getValidationState('cif').hasError && (
            <p id="cif-error" className="text-red-600 text-sm mt-1">
              {getValidationState('cif').errorMessage}
            </p>
          )}
        </div>

        {/* Sector */}
        <div className="relative">
          <Label htmlFor="industry" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.sector')} *
          </Label>
          <div className="relative">
            <Select value={companyData.industry} onValueChange={(value) => updateField('industry', value)}>
              <SelectTrigger 
                className={getFieldClassName('industry', 'pr-10')}
                aria-describedby="industry-error"
              >
                <SelectValue placeholder={t('placeholders.sector')} />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {t(`industries.${industry}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowCheckIcon('industry') && (
              <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none z-10" />
            )}
          </div>
          {(showValidation || getValidationState('industry').isTouched) && getValidationState('industry').hasError && (
            <p id="industry-error" className="text-red-600 text-sm mt-1">
              {getValidationState('industry').errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Descripción de actividad */}
      <div className="relative">
        <Label htmlFor="activityDescription" className="text-sm font-medium text-gray-700 mb-2 block">
          {t('fields.activity')} *
        </Label>
        <div className="relative">
          <Textarea
            id="activityDescription"
            value={companyData.activityDescription}
            onChange={(e) => updateField('activityDescription', e.target.value)}
            onBlur={() => handleBlur('activityDescription')}
            placeholder={t('placeholders.activity')}
            className={getFieldClassName('activityDescription', 'min-h-[100px] pr-10')}
            aria-describedby="activityDescription-error"
          />
          {shouldShowCheckIcon('activityDescription') && (
            <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {(showValidation || getValidationState('activityDescription').isTouched) && getValidationState('activityDescription').hasError && (
          <p id="activityDescription-error" className="text-red-600 text-sm mt-1">
            {getValidationState('activityDescription').errorMessage}
          </p>
        )}
      </div>

      {/* Rango de empleados */}
      <div className="relative">
        <Label htmlFor="employeeRange" className="text-sm font-medium text-gray-700 mb-2 block">
          {t('fields.employees')} *
        </Label>
        <div className="relative">
          <Select value={companyData.employeeRange} onValueChange={(value) => updateField('employeeRange', value)}>
            <SelectTrigger 
              className={getFieldClassName('employeeRange', 'pr-10')}
              aria-describedby="employeeRange-error"
            >
              <SelectValue placeholder={t('placeholders.employees')} />
            </SelectTrigger>
            <SelectContent>
              {employeeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {t(`employees.${employeeRangeKey(range.value)}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowCheckIcon('employeeRange') && (
            <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none z-10" />
          )}
        </div>
        {(showValidation || getValidationState('employeeRange').isTouched) && getValidationState('employeeRange').hasError && (
          <p id="employeeRange-error" className="text-red-600 text-sm mt-1">
            {getValidationState('employeeRange').errorMessage}
          </p>
        )}
      </div>

      {/* Texto informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {t('step1.info')}
        </p>
      </div>
    </div>
  );
};

export default BasicInfoFormMaster;