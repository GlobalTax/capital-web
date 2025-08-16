import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
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

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const getFieldClassName = (fieldName: string, value: any, baseClasses: string = '') => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = Boolean(value);
    let classes = baseClasses;
    
    if ((isTouched || showValidation)) {
      if (!isValid) {
        classes += ' border-red-500 focus:border-red-500';
      } else if (isValid) {
        classes += ' border-green-500 focus:border-green-500';
      }
    }
    
    return classes;
  };

  const shouldShowCheckIcon = (fieldName: string, value: any): boolean => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = Boolean(value);
    return (isTouched || showValidation) && isValid;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('steps.characteristics')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('step3.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Ubicación */}
        <div className="relative">
          <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.location')} *
          </Label>
          <div className="relative">
            <Select 
              value={companyData.location} 
              onValueChange={(value) => updateField('location', value)}
            >
              <SelectTrigger 
                className={getFieldClassName('location', companyData.location, 'pr-10')}
                aria-describedby="location-error"
              >
                <SelectValue placeholder={t('placeholders.location')} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {provincesSpain.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowCheckIcon('location', companyData.location) && (
              <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none z-10" />
            )}
          </div>
          {(showValidation || touchedFields.has('location')) && !companyData.location && (
            <p id="location-error" className="text-red-600 text-sm mt-1">
              {t('validation.location_required')}
            </p>
          )}
        </div>

        {/* Participación en propiedad */}
        <div className="relative">
          <Label htmlFor="ownershipParticipation" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.ownership')} *
          </Label>
          <div className="relative">
            <Select 
              value={companyData.ownershipParticipation} 
              onValueChange={(value) => updateField('ownershipParticipation', value)}
            >
              <SelectTrigger 
                className={getFieldClassName('ownershipParticipation', companyData.ownershipParticipation, 'pr-10')}
                aria-describedby="ownershipParticipation-error"
              >
                <SelectValue placeholder={t('placeholders.ownership')} />
              </SelectTrigger>
              <SelectContent>
                {ownershipParticipation.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`ownership.${option.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowCheckIcon('ownershipParticipation', companyData.ownershipParticipation) && (
              <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none z-10" />
            )}
          </div>
          {(showValidation || touchedFields.has('ownershipParticipation')) && !companyData.ownershipParticipation && (
            <p id="ownershipParticipation-error" className="text-red-600 text-sm mt-1">
              {t('validation.ownership_required')}
            </p>
          )}
        </div>

        {/* Ventaja competitiva */}
        <div className="relative">
          <Label htmlFor="competitiveAdvantage" className="text-sm font-medium text-gray-700 mb-2 block">
            {t('fields.competitive_advantage')} *
          </Label>
          <div className="relative">
            <Textarea
              id="competitiveAdvantage"
              value={companyData.competitiveAdvantage}
              onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
              onBlur={() => handleBlur('competitiveAdvantage')}
              placeholder={t('placeholders.competitive_advantage')}
              className={getFieldClassName('competitiveAdvantage', companyData.competitiveAdvantage, 'min-h-[120px] pr-10')}
              aria-describedby="competitiveAdvantage-error"
            />
            {shouldShowCheckIcon('competitiveAdvantage', companyData.competitiveAdvantage) && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
          {(showValidation || touchedFields.has('competitiveAdvantage')) && !companyData.competitiveAdvantage && (
            <p id="competitiveAdvantage-error" className="text-red-600 text-sm mt-1">
              {t('validation.competitive_advantage_required')}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {t('competitive_advantage.help')}
          </p>
        </div>
      </div>

      {/* Información sobre la importancia de estas características */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          {t('step3.importance.title')}
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>{t('step3.importance.location')}:</strong> {t('step3.importance.location_desc')}</li>
          <li>• <strong>{t('step3.importance.ownership')}:</strong> {t('step3.importance.ownership_desc')}</li>
          <li>• <strong>{t('step3.importance.advantage')}:</strong> {t('step3.importance.advantage_desc')}</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacteristicsFormMaster;