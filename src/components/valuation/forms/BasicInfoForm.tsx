
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

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
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
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

        {/* Teléfono */}
        <div className="relative">
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {t('label.phone')}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={companyData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={t('placeholder.phone')}
            className={getFieldClassName('phone', false)}
          />
          {shouldShowCheckIcon('phone') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
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
    </div>
  );
};

export default BasicInfoForm;
