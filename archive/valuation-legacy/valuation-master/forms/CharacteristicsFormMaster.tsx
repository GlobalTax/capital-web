import React, { useState, useCallback, useMemo } from 'react';
import FormField from '@/components/ui/form-field';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface CharacteristicsFormMasterProps {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const provincesSpain = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
  'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'Coruña', 'Granada', 'Elche',
  'Oviedo', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez', 'Sabadell', 'Móstoles', 'Santa Cruz', 'Pamplona', 'Almería',
  'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 'Santander', 'Burgos', 'Castellón', 'Getafe', 'Albacete', 'Alcorcón',
  'Logroño', 'Badajoz', 'Salamanca', 'Huelva', 'Marbella', 'Lleida', 'Tarragona', 'León', 'Cadiz', 'Dos Hermanas', 'Torrejon'
];

const ownershipParticipation = [
  { value: 'alta', label: 'Alta (75-100%)' },
  { value: 'media', label: 'Media (25-75%)' },
  { value: 'baja', label: 'Baja (0-25%)' }
];

const CharacteristicsFormMaster: React.FC<CharacteristicsFormMasterProps> = ({
  companyData,
  updateField,
  showValidation = false
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  const getValidationState = useCallback((fieldName: string, value: any) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = Boolean(value);
    const hasError = (isTouched || showValidation) && !isValid;
    
    return {
      isTouched,
      hasError,
      isValid,
      errorMessage: hasError ? t(`validation.${fieldName}_required`) : undefined
    };
  }, [touchedFields, showValidation, t]);

  const locationOptions = useMemo(() => 
    provincesSpain.map(province => ({
      value: province,
      label: province
    })), []);

  const ownershipOptions = useMemo(() => 
    ownershipParticipation.map(option => ({
      value: option.value,
      label: t(`ownership.${option.value}`)
    })), [t]);

  return (
    <div className="stable-form-container">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t('steps.characteristics')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('step3.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          id="location"
          label={t('fields.location')}
          type="select"
          value={companyData.location}
          onChange={(value) => updateField('location', value)}
          onBlur={() => handleBlur('location')}
          placeholder={t('placeholders.location')}
          required
          options={locationOptions}
          error={getValidationState('location', companyData.location).errorMessage}
          isValid={getValidationState('location', companyData.location).isValid}
          isTouched={getValidationState('location', companyData.location).isTouched}
          showValidation={showValidation}
          selectClassName="max-h-60"
        />

        <FormField
          id="ownershipParticipation"
          label={t('fields.ownership')}
          type="select"
          value={companyData.ownershipParticipation}
          onChange={(value) => updateField('ownershipParticipation', value)}
          onBlur={() => handleBlur('ownershipParticipation')}
          placeholder={t('placeholders.ownership')}
          required
          options={ownershipOptions}
          error={getValidationState('ownershipParticipation', companyData.ownershipParticipation).errorMessage}
          isValid={getValidationState('ownershipParticipation', companyData.ownershipParticipation).isValid}
          isTouched={getValidationState('ownershipParticipation', companyData.ownershipParticipation).isTouched}
          showValidation={showValidation}
        />

        <FormField
          id="competitiveAdvantage"
          label={t('fields.competitive_advantage')}
          type="textarea"
          value={companyData.competitiveAdvantage}
          onChange={(value) => updateField('competitiveAdvantage', value)}
          onBlur={() => handleBlur('competitiveAdvantage')}
          placeholder={t('placeholders.competitive_advantage')}
          required
          error={getValidationState('competitiveAdvantage', companyData.competitiveAdvantage).errorMessage}
          isValid={getValidationState('competitiveAdvantage', companyData.competitiveAdvantage).isValid}
          isTouched={getValidationState('competitiveAdvantage', companyData.competitiveAdvantage).isTouched}
          showValidation={showValidation}
          help={t('competitive_advantage.help')}
          className="min-h-[120px]"
        />
      </div>

      {/* Información sobre la importancia de estas características */}
      <div className="bg-accent border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-accent-foreground mb-2">
          {t('step3.importance.title')}
        </h3>
        <ul className="text-sm text-accent-foreground space-y-1">
          <li>• <strong>{t('step3.importance.location')}:</strong> {t('step3.importance.location_desc')}</li>
          <li>• <strong>{t('step3.importance.ownership')}:</strong> {t('step3.importance.ownership_desc')}</li>
          <li>• <strong>{t('step3.importance.advantage')}:</strong> {t('step3.importance.advantage_desc')}</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacteristicsFormMaster;