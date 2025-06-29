
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketingAttributionTabProps {
  attributionLoading: boolean;
  attributionReport: any;
}

const MarketingAttributionTab = ({ attributionLoading, attributionReport }: MarketingAttributionTabProps) => {
  if (attributionLoading) {
    return (
      <div className="text-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando datos de atribución...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas de Attribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Conversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attributionReport?.totalConversions || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Total</CardTitle>  
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{attributionReport?.totalValue?.toFixed(0) || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Path Length Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attributionReport?.averagePathLength?.toFixed(1) || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tiempo a Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attributionReport?.averageTimeToConversion?.toFixed(0) || 0}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Canal */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Canal</th>
                  <th className="text-left p-2">Valor Atribuido</th>
                  <th className="text-left p-2">Conversiones</th>
                  <th className="text-left p-2">Touchpoints</th>
                  <th className="text-left p-2">Valor/Conversión</th>
                </tr>
              </thead>
              <tbody>
                {attributionReport?.channelPerformance?.map((channel: any) => (
                  <tr key={channel.channel} className="border-b">
                    <td className="p-2 font-medium">{channel.channel}</td>
                    <td className="p-2">€{channel.attributedValue.toFixed(0)}</td>
                    <td className="p-2">{channel.conversions}</td>
                    <td className="p-2">{channel.touchPoints}</td>
                    <td className="p-2">€{channel.valuePerConversion.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingAttributionTab;
