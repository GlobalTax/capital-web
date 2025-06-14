

import React from 'react';
import { TrendingUp, DollarSign, Download, RefreshCw } from 'lucide-react';
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
            Sector: <span className="font-semibold capitalize">{companyData.industry}</span>
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

