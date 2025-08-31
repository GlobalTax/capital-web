
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface OperationPreviewProps {
  operation: {
    company_name: string;
    sector: string;
    year: number;
    description: string;
    is_featured: boolean;
    revenue_amount?: number;
    ebitda_amount?: number;
    growth_percentage?: number;
  };
}

const OperationPreview = ({ operation }: OperationPreviewProps) => {
  return (
    <div className="p-6 bg-gray-50">
      <h3 className="text-lg font-medium text-black mb-4">Vista Previa - Oportunidad de Inversión</h3>
      <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                {operation.sector}
              </span>
              {operation.is_featured && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Destacado
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-black mb-3 leading-tight">
            {operation.company_name}
          </h3>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Año:</span>
              <span className="font-medium text-black">{operation.year}</span>
            </div>
            {operation.revenue_amount && operation.revenue_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Facturación:</span>
                <span className="font-bold text-black">{operation.revenue_amount}M€</span>
              </div>
            )}
            {operation.ebitda_amount && operation.ebitda_amount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">EBITDA:</span>
                <span className="font-bold text-black">{operation.ebitda_amount}M€</span>
              </div>
            )}
            {operation.growth_percentage && operation.growth_percentage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Crecimiento:</span>
                <span className="font-bold text-black">{operation.growth_percentage}%</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {operation.description}
          </p>

          <div className="flex items-center text-sm text-gray-500">
            <Building className="w-4 h-4 mr-1" />
            <span>Oportunidad verificada</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationPreview;
