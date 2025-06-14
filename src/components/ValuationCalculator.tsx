
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useValuationCalculator } from '@/hooks/useValuationCalculator';
import { Calculator, TrendingUp, Building, DollarSign, BarChart3, Users, MapPin, Calendar } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calculator className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold text-black mb-4">
          Calculadora de Valoración Empresarial
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Obtén una estimación profesional del valor de tu empresa usando múltiples metodologías de valoración
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulario */}
        <div className="capittal-card">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
            <Building className="h-6 w-6 mr-3" />
            Información de la Empresa
          </h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                Nombre de la Empresa *
              </Label>
              <Input
                id="companyName"
                value={companyData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Introduce el nombre de tu empresa"
                className="capittal-input mt-1"
              />
            </div>

            <div>
              <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                Sector de Actividad *
              </Label>
              <select
                id="industry"
                value={companyData.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                className="capittal-input mt-1 w-full"
              >
                <option value="">Selecciona un sector</option>
                <option value="technology">Tecnología</option>
                <option value="healthcare">Salud y Farmacia</option>
                <option value="manufacturing">Manufactura</option>
                <option value="retail">Retail y Consumo</option>
                <option value="services">Servicios</option>
                <option value="finance">Servicios Financieros</option>
                <option value="real-estate">Inmobiliario</option>
                <option value="energy">Energía</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revenue" className="text-sm font-medium text-gray-700">
                  Facturación Anual (€) *
                </Label>
                <Input
                  id="revenue"
                  type="number"
                  value={companyData.revenue || ''}
                  onChange={(e) => updateField('revenue', Number(e.target.value))}
                  placeholder="0"
                  className="capittal-input mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ebitda" className="text-sm font-medium text-gray-700">
                  EBITDA Anual (€) *
                </Label>
                <Input
                  id="ebitda"
                  type="number"
                  value={companyData.ebitda || ''}
                  onChange={(e) => updateField('ebitda', Number(e.target.value))}
                  placeholder="0"
                  className="capittal-input mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employees" className="text-sm font-medium text-gray-700">
                  Número de Empleados
                </Label>
                <Input
                  id="employees"
                  type="number"
                  value={companyData.employees || ''}
                  onChange={(e) => updateField('employees', Number(e.target.value))}
                  placeholder="0"
                  className="capittal-input mt-1"
                />
              </div>

              <div>
                <Label htmlFor="yearFounded" className="text-sm font-medium text-gray-700">
                  Año de Fundación
                </Label>
                <Input
                  id="yearFounded"
                  type="number"
                  value={companyData.yearFounded}
                  onChange={(e) => updateField('yearFounded', Number(e.target.value))}
                  className="capittal-input mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                Ubicación Principal
              </Label>
              <Input
                id="location"
                value={companyData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Ciudad, País"
                className="capittal-input mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Tasa de Crecimiento Anual (%): {companyData.growthRate}%
              </Label>
              <Slider
                value={[companyData.growthRate]}
                onValueChange={(value) => updateField('growthRate', value[0])}
                max={50}
                min={-10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="competitiveAdvantage" className="text-sm font-medium text-gray-700">
                Ventaja Competitiva Principal
              </Label>
              <Textarea
                id="competitiveAdvantage"
                value={companyData.competitiveAdvantage}
                onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
                placeholder="Describe la principal ventaja competitiva de tu empresa..."
                className="capittal-input mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={calculateValuation}
                disabled={!isFormValid || isCalculating}
                className="capittal-button flex-1"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
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
                className="border-black hover:bg-gray-50"
              >
                Limpiar
              </Button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {result ? (
            <>
              <div className="capittal-card bg-gradient-to-br from-black to-gray-800 text-white">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 mr-3" />
                  <h3 className="text-xl font-bold">Valoración Final</h3>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {formatCurrency(result.finalValuation)}
                  </div>
                  <div className="text-lg opacity-90">
                    Rango: {formatCurrency(result.valuationRange.min)} - {formatCurrency(result.valuationRange.max)}
                  </div>
                </div>
              </div>

              <div className="capittal-card">
                <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Metodologías de Valoración
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Múltiplo de Ingresos</span>
                    <span className="text-lg font-bold">{formatCurrency(result.revenueMultiple)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Múltiplo de EBITDA</span>
                    <span className="text-lg font-bold">{formatCurrency(result.ebitdaMultiple)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Flujo de Caja Descontado</span>
                    <span className="text-lg font-bold">{formatCurrency(result.dcfValue)}</span>
                  </div>
                </div>
              </div>

              <div className="capittal-card">
                <h3 className="text-xl font-bold text-black mb-4">
                  Factores de Ajuste
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.multiples.industry.toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Múltiplo Sector</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.multiples.size.toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Ajuste Tamaño</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.multiples.growth.toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Ajuste Crecimiento</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.multiples.profitability.toFixed(1)}x
                    </div>
                    <div className="text-sm text-gray-600">Ajuste Rentabilidad</div>
                  </div>
                </div>
              </div>

              <div className="capittal-card bg-yellow-50 border-yellow-200">
                <h3 className="text-lg font-bold text-black mb-3">
                  ⚠️ Importante
                </h3>
                <p className="text-sm text-gray-700">
                  Esta es una estimación preliminar basada en múltiplos de mercado. Para una valoración 
                  profesional detallada, contacta con nuestro equipo de expertos en M&A.
                </p>
                <Button className="capittal-button mt-4">
                  Solicitar Valoración Profesional
                </Button>
              </div>
            </>
          ) : (
            <div className="capittal-card text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Completa el formulario
              </h3>
              <p className="text-gray-500">
                Introduce la información de tu empresa para obtener una valoración estimada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuationCalculator;
