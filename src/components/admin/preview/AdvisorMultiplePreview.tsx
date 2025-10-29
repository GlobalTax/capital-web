import React from 'react';

interface AdvisorMultiplePreviewProps {
  multiple: {
    sector_name: string;
    revenue_multiple_min: number;
    revenue_multiple_max: number;
    revenue_multiple_median: number;
    ebitda_multiple_min: number;
    ebitda_multiple_max: number;
    ebitda_multiple_median: number;
    net_profit_multiple_min: number;
    net_profit_multiple_max: number;
    net_profit_multiple_median: number;
    description?: string;
  };
}

const AdvisorMultiplePreview: React.FC<AdvisorMultiplePreviewProps> = ({ multiple }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{multiple.sector_name}</h3>
        {multiple.description && (
          <p className="text-gray-600 text-sm">{multiple.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Facturación */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📊</span>
            <h4 className="font-semibold text-gray-900">Facturación</h4>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-600">
              {multiple.revenue_multiple_median}x
            </div>
            <div className="text-sm text-gray-600">
              Rango: {multiple.revenue_multiple_min}x - {multiple.revenue_multiple_max}x
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">Peso en cálculo</div>
              <div className="text-sm font-medium text-gray-700">25%</div>
            </div>
          </div>
        </div>

        {/* EBITDA */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <h4 className="font-semibold text-gray-900">EBITDA</h4>
            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Principal
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-blue-700">
              {multiple.ebitda_multiple_median}x
            </div>
            <div className="text-sm text-gray-600">
              Rango: {multiple.ebitda_multiple_min}x - {multiple.ebitda_multiple_max}x
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-xs text-gray-500">Peso en cálculo</div>
              <div className="text-sm font-medium text-blue-700">50%</div>
            </div>
          </div>
        </div>

        {/* Resultado Neto */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📈</span>
            <h4 className="font-semibold text-gray-900">Resultado Neto</h4>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-purple-600">
              {multiple.net_profit_multiple_median}x
            </div>
            <div className="text-sm text-gray-600">
              Rango: {multiple.net_profit_multiple_min}x - {multiple.net_profit_multiple_max}x
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">Peso en cálculo</div>
              <div className="text-sm font-medium text-gray-700">25%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo de cálculo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Ejemplo de Valoración</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Con estos múltiplos, una empresa del sector <strong>{multiple.sector_name}</strong> con:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Facturación de 1M€ → Valoración: {multiple.revenue_multiple_median}M€</li>
            <li>EBITDA de 200K€ → Valoración: {(multiple.ebitda_multiple_median * 0.2).toFixed(1)}M€</li>
            <li>Resultado Neto de 150K€ → Valoración: {(multiple.net_profit_multiple_median * 0.15).toFixed(1)}M€</li>
          </ul>
          <p className="mt-3 pt-3 border-t border-gray-300">
            <strong>Valoración Promedio Ponderada:</strong> {' '}
            {(
              (multiple.revenue_multiple_median * 0.25) +
              (multiple.ebitda_multiple_median * 0.2 * 0.5) +
              (multiple.net_profit_multiple_median * 0.15 * 0.25)
            ).toFixed(2)}M€
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvisorMultiplePreview;
