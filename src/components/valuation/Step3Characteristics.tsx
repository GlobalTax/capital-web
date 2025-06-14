
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step3Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
}

const Step3Characteristics: React.FC<Step3Props> = ({ companyData, updateField }) => {
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
            placeholder="Ciudad, Provincia"
            className="w-full"
          />
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
            placeholder="0"
            className="w-full"
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
          placeholder="Describe qué hace única a tu empresa en el mercado..."
          rows={4}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          Por ejemplo: tecnología propia, patents, base de clientes fiel, ubicación estratégica, etc.
        </p>
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
