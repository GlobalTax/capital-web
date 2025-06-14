
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';

interface Step3Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const provincesSpain = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares',
  'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
  'Córdoba', 'Coruña (A)', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Gipuzkoa',
  'Huelva', 'Huesca', 'Jaén', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
  'Navarra', 'Ourense', 'Palencia', 'Palmas (Las)', 'Pontevedra', 'Rioja (La)',
  'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona',
  'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Bizkaia', 'Zamora', 'Zaragoza'
];

const ownershipParticipation = [
  { value: 'alta', label: 'Alta (>75%)' },
  { value: 'media', label: 'Media (25-75%)' },
  { value: 'baja', label: 'Baja (<25%)' }
];

const Step3Characteristics: React.FC<Step3Props> = ({ companyData, updateField, showValidation = false }) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const isLocationValid = Boolean(companyData.location);
  const isCompetitiveAdvantageValid = Boolean(companyData.competitiveAdvantage);
  const isOwnershipParticipationValid = Boolean(companyData.ownershipParticipation);

  const getFieldClassName = (isValid: boolean, hasValue: boolean, fieldName: string, isRequired: boolean = true) => {
    const isTouched = touchedFields.has(fieldName);
    
    if (!showValidation && !isTouched) {
      return "w-full border-black focus:ring-black focus:border-black";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full border-green-500 focus:ring-green-500 focus:border-green-500 pr-10";
    } else if (!isValid && isRequired && (showValidation || (isTouched && hasValue))) {
      return "w-full border-red-500 focus:ring-red-500 focus:border-red-500";
    }
    
    return "w-full border-black focus:ring-black focus:border-black";
  };

  const shouldShowCheckIcon = (isValid: boolean, hasValue: boolean, fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    return isValid && hasValue && (isTouched || showValidation);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Características de la Empresa</h2>
        <p className="text-gray-600">Factores adicionales que influyen en la valoración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubicación */}
        <div className="relative">
          <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación principal *
          </Label>
          <Select
            value={companyData.location}
            onValueChange={(value) => {
              updateField('location', value);
              handleBlur('location');
            }}
          >
            <SelectTrigger className={getFieldClassName(isLocationValid, Boolean(companyData.location), 'location')}>
              <SelectValue placeholder="Selecciona una provincia" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
              {provincesSpain.map((province) => (
                <SelectItem key={province} value={province} className="hover:bg-gray-100">
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowCheckIcon(isLocationValid, Boolean(companyData.location), 'location') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          {showValidation && !isLocationValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Participación de la propiedad */}
        <div className="relative">
          <Label htmlFor="ownershipParticipation" className="block text-sm font-medium text-gray-700 mb-2">
            Participación de la propiedad *
          </Label>
          <Select
            value={companyData.ownershipParticipation}
            onValueChange={(value) => {
              updateField('ownershipParticipation', value);
              handleBlur('ownershipParticipation');
            }}
          >
            <SelectTrigger className={getFieldClassName(isOwnershipParticipationValid, Boolean(companyData.ownershipParticipation), 'ownershipParticipation')}>
              <SelectValue placeholder="Selecciona el nivel de participación" />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg border border-gray-200 z-50">
              {ownershipParticipation.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-100">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowCheckIcon(isOwnershipParticipationValid, Boolean(companyData.ownershipParticipation), 'ownershipParticipation') && (
            <Check className="absolute right-8 top-10 h-4 w-4 text-green-500 pointer-events-none" />
          )}
          <p className="text-sm text-gray-500 mt-1">Nivel de participación que posees en la empresa</p>
          {showValidation && !isOwnershipParticipationValid && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>
      </div>

      {/* Ventaja competitiva */}
      <div className="relative">
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
        {shouldShowCheckIcon(isCompetitiveAdvantageValid, Boolean(companyData.competitiveAdvantage), 'competitiveAdvantage') && (
          <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
        )}
        <p className="text-sm text-gray-500 mt-1">
          Por ejemplo: tecnología propia, patentes, base de clientes fiel, ubicación estratégica, etc.
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
