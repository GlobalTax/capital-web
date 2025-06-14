
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step3Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const Step3Characteristics: React.FC<Step3Props> = ({ companyData, updateField, showValidation = false }) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const isLocationValid = Boolean(companyData.location);
  const isCompetitiveAdvantageValid = Boolean(companyData.competitiveAdvantage);
  const isMarketShareValid = true; // Este campo no es obligatorio

  const getFieldClassName = (isValid: boolean, hasValue: boolean, fieldName: string, isRequired: boolean = true) => {
    const isTouched = touchedFields.has(fieldName);
    
    if (!showValidation && !isTouched) {
      return "w-full border-black focus:ring-black focus:border-black";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full border-green-500 focus:ring-green-500 focus:border-green-500";
    } else if (!isValid && isRequired && (showValidation || (isTouched && hasValue))) {
      return "w-full border-red-500 focus:ring-red-500 focus:border-red-500";
    }
    
    return "w-full border-black focus:ring-black focus:border-black";
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Características de la Empresa</h2>
        <p className="text-gray-600">Factores adicionales que influyen en la valoración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubicación */}
        <div>
          <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación principal *
          </Label>
          <Input
            id="location"
            value={companyData.location}
            onChange={(e) => updateField('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            placeholder="Ciudad, Provincia"
            className={getFieldClassName(isLocationValid, Boolean(companyData.location), 'location')}
          />
          {showValidation && !isLocationValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Cuota de mercado */}
        <div>
          <Label htmlFor="marketShare" className="block text-sm font-medium text-gray-700 mb-2">
            Cuota de mercado estimada (%)
          </Label>
          <Input
            id="marketShare"
            type="number"
            min="0"
            max="100"
            value={companyData.marketShare || ''}
            onChange={(e) => updateField('marketShare', Number(e.target.value))}
            onBlur={() => handleBlur('marketShare')}
            placeholder="0"
            className={getFieldClassName(isMarketShareValid, Boolean(companyData.marketShare), 'marketShare', false)}
          />
          <p className="text-sm text-gray-500 mt-1">Porcentaje aproximado de participación en tu mercado</p>
        </div>
      </div>

      {/* Ventaja competitiva */}
      <div>
        <Label htmlFor="competitiveAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
          Principal ventaja competitiva *
        </Label>
        <Textarea
          id="competitiveAdvantage"
          value={companyData.competitiveAdvantage}
          onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
          onBlur={() => handleBlur('competitiveAdvantage')}
          placeholder="Describe qué hace única a tu empresa en el mercado..."
          rows={4}
          className={getFieldClassName(isCompetitiveAdvantageValid, Boolean(companyData.competitiveAdvantage), 'competitiveAdvantage')}
        />
        <p className="text-sm text-gray-500 mt-1">
          Por ejemplo: tecnología propia, patents, base de clientes fiel, ubicación estratégica, etc.
        </p>
        {showValidation && !isCompetitiveAdvantageValid && (
          <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          ¿Por qué es importante?
        </h3>
        <p className="text-sm text-green-700">
          Estos factores cualitativos pueden impactar significativamente la valoración final, 
          ya que representan activos intangibles y posicionamiento estratégico de la empresa.
        </p>
      </div>
    </div>
  );
};

export default Step3Characteristics;
