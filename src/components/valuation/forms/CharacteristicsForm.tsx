import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { useI18n } from '@/shared/i18n/I18nProvider';

interface CharacteristicsFormProps {
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

const CharacteristicsForm: React.FC<CharacteristicsFormProps> = ({
  companyData,
  updateField,
  showValidation = false,
  getFieldState,
  handleFieldBlur,
  errors
}) => {
  const { t } = useI18n();
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const ownershipOptions = [
    { value: 'alta', label: 'Alta (>75%)' },
    { value: 'media', label: 'Media (25-75%)' },
    { value: 'baja', label: 'Baja (<25%)' }
  ];

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('form.characteristics.title')}</h2>
        <p className="text-gray-600">{t('form.characteristics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Location */}
        <div className="h-[120px] flex flex-col">
          <div className="relative flex-1">
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.location')}
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              value={companyData.location || ''}
              onChange={(e) => updateField('location', e.target.value)}
              onBlur={() => handleBlur('location')}
              placeholder={t('placeholder.location')}
              className={getFieldClassName('location')}
            />
            {shouldShowCheckIcon('location') && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="h-[40px] mt-1 space-y-1">
            <p className="text-sm text-gray-500">{t('helper.location')}</p>
            <p className={`text-red-500 text-sm transition-opacity duration-200 ${showValidation && errors?.location ? 'opacity-100' : 'opacity-0'}`}>
              {errors?.location || '\u00A0'}
            </p>
          </div>
        </div>

        {/* Ownership Participation */}
        <div className="h-[100px] flex flex-col">
          <div className="relative flex-1">
            <Label htmlFor="ownershipParticipation-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.ownership')}
            </Label>
            <Select
              value={companyData.ownershipParticipation || ''}
              onValueChange={(value) => {
                updateField('ownershipParticipation', value);
                handleBlur('ownershipParticipation');
              }}
            >
              <SelectTrigger 
                id="ownershipParticipation-select"
                name="ownershipParticipation"
                className={getFieldClassName('ownershipParticipation')}
              >
                <SelectValue placeholder={t('placeholder.ownership')} />
              </SelectTrigger>
              <SelectContent className="bg-white shadow-lg border border-gray-200 z-[100]">
                {ownershipOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowCheckIcon('ownershipParticipation') && (
              <Check className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
            )}
          </div>
          <div className="h-[20px] mt-1 flex items-start">
            <p className={`text-red-500 text-sm transition-opacity duration-200 ${showValidation && errors?.ownershipParticipation ? 'opacity-100' : 'opacity-0'}`}>
              {errors?.ownershipParticipation || '\u00A0'}
            </p>
          </div>
        </div>

        {/* Competitive Advantage */}
        <div className="h-[140px] flex flex-col">
          <div className="relative flex-1">
            <Label htmlFor="competitiveAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
              {t('label.competitive_advantage')}
            </Label>
            <Textarea
              id="competitiveAdvantage"
              name="competitiveAdvantage"
              value={companyData.competitiveAdvantage || ''}
              onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
              onBlur={() => handleBlur('competitiveAdvantage')}
              placeholder={t('placeholder.competitive_advantage')}
              className={`${getFieldClassName('competitiveAdvantage')} min-h-[80px] resize-none`}
              rows={3}
            />
          </div>
          <div className="h-[40px] mt-1 space-y-1">
            <p className="text-sm text-gray-500">{t('helper.competitive_advantage')}</p>
            <p className={`text-red-500 text-sm transition-opacity duration-200 ${showValidation && errors?.competitiveAdvantage ? 'opacity-100' : 'opacity-0'}`}>
              {errors?.competitiveAdvantage || '\u00A0'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 mb-2">
          {t('help.characteristics_title')}
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• {t('help.location_tip')}</li>
          <li>• {t('help.ownership_tip')}</li>
          <li>• {t('help.advantage_tip')}</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacteristicsForm;