
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step2Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
}

const Step2FinancialData: React.FC<Step2Props> = ({ companyData, updateField }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos Financieros</h2>
        <p className="text-gray-600">Información financiera clave de tu empresa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos anuales */}
        <div>
          <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
            Ingresos Anuales (€) *
          </Label>
          <Input
            id="revenue"
            type="number"
            min="0"
            value={companyData.revenue || ''}
            onChange={(e) => updateField('revenue', Number(e.target.value))}
            placeholder="0"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">Facturación anual total</p>
        </div>

        {/* EBITDA */}
        <div>
          <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA (€) *
          </Label>
          <Input
            id="ebitda"
            type="number"
            min="0"
            value={companyData.ebitda || ''}
            onChange={(e) => updateField('ebitda', Number(e.target.value))}
            placeholder="0"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">Beneficio antes de intereses, impuestos, depreciaciones y amortizaciones</p>
        </div>

        {/* Tasa de crecimiento */}
        <div className="md:col-span-2">
          <Label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de Crecimiento Anual (%)
          </Label>
          <Input
            id="growthRate"
            type="number"
            min="0"
            max="100"
            value={companyData.growthRate || ''}
            onChange={(e) => updateField('growthRate', Number(e.target.value))}
            placeholder="0"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">Crecimiento promedio de ingresos en los últimos años</p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Información Importante
        </h3>
        <p className="text-sm text-blue-700">
          Estos datos financieros son fundamentales para calcular una valoración precisa. 
          Asegúrate de que corresponden al último ejercicio fiscal completo.
        </p>
      </div>
    </div>
  );
};

export default Step2FinancialData;
