
import React from 'react';
import { TrendingUp, DollarSign, Download, RefreshCw, Building, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step4Props {
  result: any;
  companyData: any;
  isCalculating: boolean;
  resetCalculator: () => void;
}

const Step4Results: React.FC<Step4Props> = ({ result, companyData, isCalculating, resetCalculator }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEmployeeRangeLabel = (range: string) => {
    const ranges: { [key: string]: string } = {
      '1-10': '1-10 empleados',
      '11-50': '11-50 empleados',
      '51-200': '51-200 empleados',
      '201-500': '201-500 empleados',
      '500+': 'Más de 500 empleados'
    };
    return ranges[range] || range;
  };

  const getOwnershipLabel = (participation: string) => {
    const labels: { [key: string]: string } = {
      'alta': 'Alta (>75%)',
      'media': 'Media (25-75%)',
      'baja': 'Baja (<25%)'
    };
    return labels[participation] || participation;
  };

  if (isCalculating) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calculando Valoración</h2>
        <p className="text-gray-600">Analizando los datos de tu empresa...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Sin resultados aún
        </h3>
        <p className="text-gray-500">
          Completa todos los pasos para obtener la valoración de tu empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
          <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
          Valoración de {companyData.companyName}
        </h2>
        <p className="text-gray-600">Resultados basados en múltiplos de mercado por sector</p>
      </div>

      {/* Resumen de datos de la empresa */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="h-5 w-5 mr-2 text-blue-600" />
          Resumen de Datos de la Empresa
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Información básica */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Información Básica</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Empresa:</span>
                <span className="ml-2 font-medium">{companyData.companyName}</span>
              </div>
              <div>
                <span className="text-gray-600">CIF:</span>
                <span className="ml-2 font-medium">{companyData.cif}</span>
              </div>
              <div>
                <span className="text-gray-600">Contacto:</span>
                <span className="ml-2 font-medium">{companyData.contactName}</span>
              </div>
              <div>
                <span className="text-gray-600">Sector:</span>
                <span className="ml-2 font-medium capitalize">{companyData.industry}</span>
              </div>
              <div>
                <span className="text-gray-600">Años operando:</span>
                <span className="ml-2 font-medium">{companyData.yearsOfOperation} años</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-600 mr-1" />
                <span className="text-gray-600">Empleados:</span>
                <span className="ml-2 font-medium">{getEmployeeRangeLabel(companyData.employeeRange)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-600 mr-1" />
                <span className="text-gray-600">Ubicación:</span>
                <span className="ml-2 font-medium">{companyData.location}</span>
              </div>
            </div>
          </div>

          {/* Datos financieros */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Datos Financieros</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Ingresos anuales:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.revenue)}</span>
              </div>
              <div>
                <span className="text-gray-600">EBITDA:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyData.ebitda)}</span>
              </div>
              <div>
                <span className="text-gray-600">Margen beneficio neto:</span>
                <span className="ml-2 font-medium">{companyData.netProfitMargin}%</span>
              </div>
              {companyData.growthRate > 0 && (
                <div>
                  <span className="text-gray-600">Tasa crecimiento:</span>
                  <span className="ml-2 font-medium">{companyData.growthRate}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Características adicionales */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Características</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Participación:</span>
                <span className="ml-2 font-medium">{getOwnershipLabel(companyData.ownershipParticipation)}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Ventaja competitiva:</span>
                <span className="text-gray-800 text-xs bg-white p-2 rounded border block">
                  {companyData.competitiveAdvantage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valoración principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Múltiplo Final</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">
            {(result.finalValuation / companyData.revenue).toFixed(1)}x
          </p>
          <p className="text-sm text-gray-600">
            Sobre ingresos de {formatCurrency(companyData.revenue)}
          </p>
        </div>
      </div>

      {/* Métodos de valoración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Valoración por Facturación</h4>
          <p className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(result.revenueMultiple)}</p>
          <p className="text-xs text-gray-500">{result.multiples.revenueMultipleUsed}x múltiplo de facturación</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Valoración por EBITDA</h4>
          <p className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(result.ebitdaMultiple)}</p>
          <p className="text-xs text-gray-500">{result.multiples.ebitdaMultipleUsed}x múltiplo de EBITDA</p>
        </div>
      </div>

      {/* Información de múltiplos aplicados */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Múltiplos Aplicados por Sector</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Múltiplo EBITDA</p>
            <p className="text-lg font-bold text-blue-600">{result.multiples.ebitdaMultipleUsed}x</p>
            <p className="text-xs text-gray-500">Peso: 70%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Múltiplo Facturación</p>
            <p className="text-lg font-bold text-green-600">{result.multiples.revenueMultipleUsed}x</p>
            <p className="text-xs text-gray-500">Peso: 30%</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Sector: <span className="font-semibold capitalize">{companyData.industry}</span> • 
            <span className="ml-2">Empleados: {getEmployeeRangeLabel(companyData.employeeRange)}</span>
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={resetCalculator}
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Nueva Valoración
        </Button>
        <Button className="flex items-center">
          <Download className="h-4 w-4 mr-2" />
          Descargar Informe
        </Button>
      </div>

      {/* Aviso legal */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Aviso Importante
        </h3>
        <p className="text-sm text-yellow-700">
          Esta valoración es una estimación basada en múltiplos de mercado por sector y no debe considerarse 
          como asesoramiento financiero profesional. Para valoraciones empresariales precisas, consulte con 
          un asesor financiero cualificado o un experto en valoración empresarial.
        </p>
      </div>
    </div>
  );
};

export default Step4Results;
