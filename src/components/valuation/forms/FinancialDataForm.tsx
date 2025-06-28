
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface FinancialDataFormProps {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const FinancialDataForm: React.FC<FinancialDataFormProps> = ({
  companyData,
  updateField,
  showValidation = false
}) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const formatCurrency = (value: number): string => {
    if (!value || value === 0) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isFieldValid = (fieldName: string, minValue: number = 0): boolean => {
    const value = companyData[fieldName];
    return value !== undefined && value !== null && value > minValue;
  };

  const getFieldClassName = (fieldName: string, isRequired: boolean = true, minValue: number = 0) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, minValue);
    const hasValue = Boolean(companyData[fieldName]);
    
    if (!showValidation && !isTouched) {
      return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
    }
    
    if (isValid && hasValue && (isTouched || showValidation)) {
      return "w-full border-0.5 border-green-500 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 rounded-lg px-4 py-3 pr-10";
    } else if (!isValid && isRequired && (showValidation || (isTouched && !hasValue))) {
      return "w-full border-0.5 border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 rounded-lg px-4 py-3";
    }
    
    return "w-full border-0.5 border-black focus:ring-2 focus:ring-black/20 focus:border-black rounded-lg px-4 py-3";
  };

  const shouldShowCheckIcon = (fieldName: string, minValue: number = 0) => {
    const isTouched = touchedFields.has(fieldName);
    const isValid = isFieldValid(fieldName, minValue);
    const hasValue = Boolean(companyData[fieldName]);
    return isValid && hasValue && (isTouched || showValidation);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Información Financiera</h2>
        <p className="text-gray-600">Datos del último ejercicio fiscal completo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facturación anual */}
        <div className="relative">
          <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
            Facturación anual *
          </Label>
          <Input
            id="revenue"
            name="revenue"
            type="number"
            min="0"
            step="1000"
            value={companyData.revenue || ''}
            onChange={(e) => updateField('revenue', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('revenue')}
            placeholder="500000"
            className={getFieldClassName('revenue', true, 0)}
          />
          {shouldShowCheckIcon('revenue') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            {companyData.revenue ? `Aprox. ${formatCurrency(companyData.revenue)}` : 'Ingresos totales del último año'}
          </p>
          {showValidation && !isFieldValid('revenue') && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* EBITDA */}
        <div className="relative">
          <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
            EBITDA *
          </Label>
          <Input
            id="ebitda"
            name="ebitda"
            type="number"
            step="1000"
            value={companyData.ebitda || ''}
            onChange={(e) => updateField('ebitda', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('ebitda')}
            placeholder="100000"
            className={getFieldClassName('ebitda')}
          />
          {shouldShowCheckIcon('ebitda') && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            {companyData.ebitda ? `Aprox. ${formatCurrency(companyData.ebitda)}` : 'Beneficio antes de intereses, impuestos, depreciación y amortización'}
          </p>
          {showValidation && !isFieldValid('ebitda') && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Margen de beneficio neto */}
        <div className="relative">
          <Label htmlFor="netProfitMargin" className="block text-sm font-medium text-gray-700 mb-2">
            Margen de beneficio neto (%) *
          </Label>
          <Input
            id="netProfitMargin"
            name="netProfitMargin"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={companyData.netProfitMargin || ''}
            onChange={(e) => updateField('netProfitMargin', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('netProfitMargin')}
            placeholder="15.5"
            className={getFieldClassName('netProfitMargin', true, 0)}
          />
          {shouldShowCheckIcon('netProfitMargin', 0) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            Porcentaje del beneficio neto sobre las ventas
          </p>
          {showValidation && !isFieldValid('netProfitMargin', 0) && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>

        {/* Tasa de crecimiento */}
        <div className="relative">
          <Label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de crecimiento anual (%) *
          </Label>
          <Input
            id="growthRate"
            name="growthRate"
            type="number"
            min="-100"
            max="1000"
            step="0.1"
            value={companyData.growthRate || ''}
            onChange={(e) => updateField('growthRate', parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur('growthRate')}
            placeholder="10.0"
            className={getFieldClassName('growthRate', true, -100)}
          />
          {shouldShowCheckIcon('growthRate', -100) && (
            <Check className="absolute right-3 top-10 h-4 w-4 text-green-500" />
          )}
          <p className="text-sm text-gray-500 mt-1">
            Crecimiento de facturación respecto al año anterior
          </p>
          {showValidation && !isFieldValid('growthRate', -100) && (
            <p className="text-red-500 text-sm mt-1">Este campo es obligatorio</p>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          ¿Necesita ayuda con estos datos?
        </h3>
        <p className="text-sm text-blue-700">
          Si no dispone de algunos de estos datos, nuestro equipo puede ayudarle a obtenerlos 
          de sus estados financieros. La precisión de estos datos es crucial para una valoración exacta.
        </p>
      </div>
    </div>
  );
};

export default FinancialDataForm;
