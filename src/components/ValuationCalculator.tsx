
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { Calculator, TrendingUp, Building2, DollarSign } from 'lucide-react';

const ValuationCalculator = () => {
  const { 
    companyData, 
    result, 
    isCalculating, 
    updateField, 
    calculateValuation, 
    resetCalculator 
  } = useValuationCalculator();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isFormValid = companyData.companyName && 
                     companyData.industry && 
                     companyData.revenue > 0 && 
                     companyData.ebitda > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Calculadora de Valoración Empresarial
          </h1>
          <p className="text-lg text-gray-600">
            Obtén una valoración estimada de tu empresa utilizando metodologías estándar de la industria
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <Label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Ingresa el nombre de la empresa"
                className="w-full"
              />
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Sector *
              </Label>
              <Select value={companyData.industry} onValueChange={(value) => updateField('industry', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Tecnología</SelectItem>
                  <SelectItem value="healthcare">Salud</SelectItem>
                  <SelectItem value="manufacturing">Manufactura</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="finance">Servicios Financieros</SelectItem>
                  <SelectItem value="real-estate">Inmobiliario</SelectItem>
                  <SelectItem value="energy">Energía</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Annual Revenue */}
            <div>
              <Label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
                Ingresos Anuales (€) *
              </Label>
              <Input
                id="revenue"
                type="number"
                value={companyData.revenue || ''}
                onChange={(e) => updateField('revenue', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* EBITDA */}
            <div>
              <Label htmlFor="ebitda" className="block text-sm font-medium text-gray-700 mb-2">
                EBITDA (€) *
              </Label>
              <Input
                id="ebitda"
                type="number"
                value={companyData.ebitda || ''}
                onChange={(e) => updateField('ebitda', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Number of Employees */}
            <div>
              <Label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Empleados
              </Label>
              <Input
                id="employees"
                type="number"
                value={companyData.employees || ''}
                onChange={(e) => updateField('employees', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>

            {/* Year Founded */}
            <div>
              <Label htmlFor="yearFounded" className="block text-sm font-medium text-gray-700 mb-2">
                Año de Fundación
              </Label>
              <Input
                id="yearFounded"
                type="number"
                value={companyData.yearFounded}
                onChange={(e) => updateField('yearFounded', Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </Label>
              <Input
                id="location"
                value={companyData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Ciudad, País"
                className="w-full"
              />
            </div>

            {/* Growth Rate */}
            <div>
              <Label htmlFor="growthRate" className="block text-sm font-medium text-gray-700 mb-2">
                Tasa de Crecimiento Anual (%)
              </Label>
              <Input
                id="growthRate"
                type="number"
                value={companyData.growthRate}
                onChange={(e) => updateField('growthRate', Number(e.target.value))}
                placeholder="0"
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              onClick={calculateValuation}
              disabled={!isFormValid || isCalculating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Valoración
                </>
              )}
            </Button>
            
            <Button
              onClick={resetCalculator}
              variant="outline"
              className="px-8"
            >
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
              Resultados de la Valoración
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Valoración Estimada</h3>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCurrency(result.finalValuation)}
                </p>
                <p className="text-sm text-gray-600">
                  Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Múltiplo de Ingresos</h3>
                <p className="text-3xl font-bold text-green-600 mb-2">
                  {(result.finalValuation / companyData.revenue).toFixed(1)}x
                </p>
                <p className="text-sm text-gray-600">
                  Basado en {formatCurrency(companyData.revenue)} de ingresos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Múltiplo de Ingresos</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.revenueMultiple)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Múltiplo EBITDA</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.ebitdaMultiple)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Valoración DCF</h4>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(result.dcfValue)}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Aviso Importante
              </h3>
              <p className="text-sm text-yellow-700">
                Esta valoración es una estimación basada en múltiplos de mercado generales y no debe considerarse 
                como asesoramiento financiero profesional. Para valoraciones empresariales precisas, consulte con 
                un asesor financiero cualificado o un experto en valoración empresarial.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Listo para Calcular
            </h3>
            <p className="text-gray-500">
              Completa los campos requeridos arriba y haz clic en "Calcular Valoración" para obtener tu estimación.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationCalculator;
