
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface Step2Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const Step2FinancialData: React.FC<Step2Props> = ({ companyData, updateField, showValidation = false }) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const isRevenueValid = Boolean(companyData.revenue > 0);
  const isEbitdaValid = Boolean(companyData.ebitda > 0);
  const isGrowthRateValid = true; // Este campo no es obligatorio

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos Financieros</h2>
        <p className="text-gray-600">Información financiera clave de tu empresa</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingresos anuales */}
        <div className="relative">
          <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
            Ingresos Anuales (€) *
          </Label>
          <Input
            id="revenue"
            type="number"
            min="0"
            value={companyData.revenue || ''}
            onChange={(e) => updateField('revenue', Number(e.target.value))}
            onBlur={() => handleBlur('revenue')}
            placeholder="0"
            className={getFieldClassName(isRevenueValid, Boolean(companyData.revenue), 'revenue')}
          />
          {shouldShowCheckIcon(isRevenueValid, Boolean(companyData.revenue), 'revenue') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">Facturación anual total</p>
          {showValidation && !isRevenueValid && (
            <p className="text-red-500 text-sm mt-1">Debe ser mayor que 0</p>
          )}
        </div>

        {/* EBITDA */}
        <div className="relative">
          <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA (€) *
          </Label>
          <Input
            id="ebitda"
            type="number"
            min="0"
            value={companyData.ebitda || ''}
            onChange={(e) => updateField('ebitda', Number(e.target.value))}
            onBlur={() => handleBlur('ebitda')}
            placeholder="0"
            className={getFieldClassName(isEbitdaValid, Boolean(companyData.ebitda), 'ebitda')}
          />
          {shouldShowCheckIcon(isEbitdaValid, Boolean(companyData.ebitda), 'ebitda') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">Beneficio antes de intereses, impuestos, depreciaciones y amortizaciones</p>
          {showValidation && !isEbitdaValid && (
            <p className="text-red-500 text-sm mt-1">Debe ser mayor que 0</p>
          )}
        </div>

        {/* Tasa de crecimiento */}
        <div className="md:col-span-2 relative">
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
            onBlur={() => handleBlur('growthRate')}
            placeholder="0"
            className={getFieldClassName(isGrowthRateValid, Boolean(companyData.growthRate), 'growthRate', false)}
          />
          {shouldShowCheckIcon(isGrowthRateValid, Boolean(companyData.growthRate), 'growthRate') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">Crecimiento promedio de ingresos en los últimos años</p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          Información Importante
        </h3>
        <p className="text-sm text-gray-700">
          Estos datos financieros son fundamentales para calcular una valoración precisa. 
          Asegúrate de que corresponden al último ejercicio fiscal completo.
        </p>
      </div>
    </div>
  );
};

export default Step2FinancialData;
