
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Percent } from 'lucide-react';

interface Step2Props {
  companyData: any;
  updateField: (field: string, value: string | number) => void;
  showValidation?: boolean;
}

const Step2FinancialData: React.FC<Step2Props> = ({ companyData, updateField, showValidation = false }) => {
  const [touchedFields, setTouchedFields] = React.useState<Set<string>>(new Set());
  const [displayValues, setDisplayValues] = React.useState({
    revenue: '',
    ebitda: ''
  });

  // Inicializar valores de display cuando cambian los datos de la empresa
  React.useEffect(() => {
    setDisplayValues({
      revenue: companyData.revenue ? formatNumber(companyData.revenue) : '',
      ebitda: companyData.ebitda ? formatNumber(companyData.ebitda) : ''
    });
  }, [companyData.revenue, companyData.ebitda]);

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  // Función para formatear números con puntos como separadores de miles
  const formatNumber = (num: number): string => {
    if (!num || num === 0) return '';
    return num.toLocaleString('es-ES');
  };

  // Función para parsear números desde el input (remover puntos)
  const parseNumber = (value: string): number => {
    const cleanValue = value.replace(/\./g, '').replace(/,/g, '');
    const parsed = Number(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleNumberChange = (field: string, value: string) => {
    // Actualizar el valor de display
    setDisplayValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Parsear y actualizar el valor real
    const numericValue = parseNumber(value);
    updateField(field, numericValue);
  };

  const handleNumberBlur = (field: string) => {
    handleBlur(field);
    // Formatear el valor cuando pierde el foco
    const currentValue = field === 'revenue' ? companyData.revenue : companyData.ebitda;
    if (currentValue > 0) {
      setDisplayValues(prev => ({
        ...prev,
        [field]: formatNumber(currentValue)
      }));
    }
  };

  const isRevenueValid = Boolean(companyData.revenue > 0);
  const isEbitdaValid = Boolean(companyData.ebitda > 0);
  const isGrowthRateValid = true; // Este campo no es obligatorio
  const isNetProfitMarginValid = Boolean(companyData.netProfitMargin >= 0 && companyData.netProfitMargin <= 100);

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
            name="revenue"
            type="text"
            autoComplete="off"
            value={displayValues.revenue}
            onChange={(e) => handleNumberChange('revenue', e.target.value)}
            onBlur={() => handleNumberBlur('revenue')}
            placeholder="Ej. 500.000"
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
            name="ebitda"
            type="text"
            autoComplete="off"
            value={displayValues.ebitda}
            onChange={(e) => handleNumberChange('ebitda', e.target.value)}
            onBlur={() => handleNumberBlur('ebitda')}
            placeholder="Ej. 100.000"
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

        {/* Margen de beneficio neto */}
        <div className="relative">
          <Label htmlFor="netProfitMargin" className="block text-sm font-medium text-gray-700 mb-2">
            Margen de Beneficio Neto (%) *
          </Label>
          <div className="relative">
            <Input
              id="netProfitMargin"
              name="netProfitMargin"
              type="number"
              autoComplete="off"
              min="0"
              max="100"
              step="0.1"
              value={companyData.netProfitMargin || ''}
              onChange={(e) => updateField('netProfitMargin', Number(e.target.value))}
              onBlur={() => handleBlur('netProfitMargin')}
              placeholder="Ej. 15.5"
              className={getFieldClassName(isNetProfitMarginValid, Boolean(companyData.netProfitMargin), 'netProfitMargin')}
            />
            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            {shouldShowCheckIcon(isNetProfitMarginValid, Boolean(companyData.netProfitMargin), 'netProfitMargin') && (
              <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Beneficio neto como porcentaje de los ingresos</p>
          {showValidation && !isNetProfitMarginValid && (
            <p className="text-red-500 text-sm mt-1">Debe ser entre 0 y 100</p>
          )}
        </div>

        {/* Tasa de crecimiento */}
        <div className="relative">
          <Label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
            Tasa de Crecimiento Anual (%)
          </Label>
          <Input
            id="growthRate"
            name="growthRate"
            type="number"
            autoComplete="off"
            min="0"
            max="100"
            value={companyData.growthRate || ''}
            onChange={(e) => updateField('growthRate', Number(e.target.value))}
            onBlur={() => handleBlur('growthRate')}
            placeholder="Ej. 15"
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
