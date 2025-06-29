
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingMetrics } from '@/types/marketingHub';

interface MarketingHubTrafficTabProps {
  marketingMetrics?: MarketingMetrics;
}

const MarketingHubTrafficTab = ({ marketingMetrics }: MarketingHubTrafficTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🌐 Traffic Intelligence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {marketingMetrics?.totalVisitors}
            </div>
            <div className="text-gray-600 mt-2">Visitantes Totales</div>
          </div>
          
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {marketingMetrics?.companyVisitors}
            </div>
            <div className="text-gray-600 mt-2">Visitantes Empresa</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {marketingMetrics?.identifiedCompanies}
            </div>
            <div className="text-gray-600 mt-2">Empresas Identificadas</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-sm text-yellow-800">
            <strong>💡 Tip:</strong> Las empresas identificadas representan el {
              marketingMetrics?.totalVisitors ? 
              ((marketingMetrics.identifiedCompanies / marketingMetrics.totalVisitors) * 100).toFixed(1) 
              : 0
            }% de tu tráfico total. 
            Considera implementar más herramientas de identificación para aumentar este porcentaje.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingHubTrafficTab;
