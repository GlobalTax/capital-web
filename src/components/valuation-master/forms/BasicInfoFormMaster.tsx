import React, { useState, useCallback, useMemo } from 'react';
import FormField from '@/components/ui/form-field';
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

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    if (handleFieldBlur) {
      handleFieldBlur(fieldName);
    }
  }, [handleFieldBlur]);

  const getValidationState = useCallback((fieldName: string) => {
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
  }, [touchedFields, getFieldState, errors, companyData]);

  const industryOptions = useMemo(() => 
    industries.map(industry => ({
      value: industry,
      label: t(`industries.${industry}`)
    })), [t]);

  const employeeRangeKey = useCallback((value: string) => {
    const keyMap: { [key: string]: string } = {
      '1-10': '1_10',
      '11-50': '11_50',
      '51-200': '51_200',
      '201-500': '201_500',
      '500+': '501_plus'
    };
    return keyMap[value] || value;
  }, []);

  const employeeOptions = useMemo(() => 
    employeeRanges.map(range => ({
      value: range.value,
      label: t(`employees.${employeeRangeKey(range.value)}`)
    })), [t, employeeRangeKey]);

  const handlePhoneChange = useCallback((value: string | number) => {
    const phoneValue = String(value);
    updateField('phone', phoneValue);
    
    // Normalizar a E.164 automáticamente
    const normalizedPhone = normalizeToE164(phoneValue, 'ES');
    if (normalizedPhone) {
      updateField('phone_e164', normalizedPhone);
    }
  }, [updateField]);

  return (
    <div className="stable-form-container">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('steps.basic_info')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('step1.subtitle')}
        </p>
      </div>

      <div className="stable-grid">
        <FormField
          id="contactName"
          label={t('fields.contact')}
          type="text"
          value={companyData.contactName}
          onChange={(value) => updateField('contactName', value)}
          onBlur={() => handleBlur('contactName')}
          placeholder={t('placeholders.contact')}
          required
          error={getValidationState('contactName').errorMessage}
          isValid={getValidationState('contactName').isValid}
          isTouched={getValidationState('contactName').isTouched}
          showValidation={showValidation}
        />

        <FormField
          id="companyName"
          label={t('fields.company')}
          type="text"
          value={companyData.companyName}
          onChange={(value) => updateField('companyName', value)}
          onBlur={() => handleBlur('companyName')}
          placeholder={t('placeholders.company')}
          required
          error={getValidationState('companyName').errorMessage}
          isValid={getValidationState('companyName').isValid}
          isTouched={getValidationState('companyName').isTouched}
          showValidation={showValidation}
        />

        <FormField
          id="email"
          label={t('fields.email')}
          type="email"
          value={companyData.email}
          onChange={(value) => updateField('email', value)}
          onBlur={() => handleBlur('email')}
          placeholder={t('placeholders.email')}
          required
          error={getValidationState('email').errorMessage}
          isValid={getValidationState('email').isValid}
          isTouched={getValidationState('email').isTouched}
          showValidation={showValidation}
        />

        <FormField
          id="phone"
          label={t('fields.phone')}
          type="tel"
          value={companyData.phone}
          onChange={handlePhoneChange}
          onBlur={() => handleBlur('phone')}
          placeholder={t('placeholders.phone')}
          required
          error={getValidationState('phone').errorMessage}
          isValid={getValidationState('phone').isValid}
          isTouched={getValidationState('phone').isTouched}
          showValidation={showValidation}
          help={companyData.phone_e164 ? `Formato internacional: ${companyData.phone_e164}` : undefined}
        />

        <FormField
          id="cif"
          label={`${t('fields.cif')} (${t('optional')})`}
          type="text"
          value={companyData.cif}
          onChange={(value) => updateField('cif', String(value).toUpperCase())}
          onBlur={() => handleBlur('cif')}
          placeholder={t('placeholders.cif')}
          error={getValidationState('cif').errorMessage}
          isValid={getValidationState('cif').isValid}
          isTouched={getValidationState('cif').isTouched}
          showValidation={showValidation}
        />

        <FormField
          id="industry"
          label={t('fields.sector')}
          type="select"
          value={companyData.industry}
          onChange={(value) => updateField('industry', value)}
          onBlur={() => handleBlur('industry')}
          placeholder={t('placeholders.sector')}
          required
          options={industryOptions}
          error={getValidationState('industry').errorMessage}
          isValid={getValidationState('industry').isValid}
          isTouched={getValidationState('industry').isTouched}
          showValidation={showValidation}
        />
      </div>

      <FormField
        id="activityDescription"
        label={t('fields.activity')}
        type="textarea"
        value={companyData.activityDescription}
        onChange={(value) => updateField('activityDescription', value)}
        onBlur={() => handleBlur('activityDescription')}
        placeholder={t('placeholders.activity')}
        required
        error={getValidationState('activityDescription').errorMessage}
        isValid={getValidationState('activityDescription').isValid}
        isTouched={getValidationState('activityDescription').isTouched}
        showValidation={showValidation}
      />

      <FormField
        id="employeeRange"
        label={t('fields.employees')}
        type="select"
        value={companyData.employeeRange}
        onChange={(value) => updateField('employeeRange', value)}
        onBlur={() => handleBlur('employeeRange')}
        placeholder={t('placeholders.employees')}
        required
        options={employeeOptions}
        error={getValidationState('employeeRange').errorMessage}
        isValid={getValidationState('employeeRange').isValid}
        isTouched={getValidationState('employeeRange').isTouched}
        showValidation={showValidation}
      />

      {/* Texto informativo */}
      <div className="bg-accent border border-border rounded-lg p-4">
        <p className="text-sm text-accent-foreground">
          {t('step1.info')}
        </p>
      </div>
    </div>
  );
};

export default BasicInfoFormMaster;