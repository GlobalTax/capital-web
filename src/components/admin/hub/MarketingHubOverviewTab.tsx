
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingMetrics, ROIAnalytics } from '@/types/marketingHub';

interface MarketingHubOverviewTabProps {
  marketingMetrics?: MarketingMetrics;
  roiAnalytics?: ROIAnalytics;
}

const MarketingHubOverviewTab = ({ marketingMetrics, roiAnalytics }: MarketingHubOverviewTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen de ROI */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 ROI General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {roiAnalytics?.overallROI}%
              </div>
              <p className="text-gray-600">Retorno de Inversión Global</p>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div>
                  <div className="text-2xl font-bold">€{roiAnalytics?.totalInvestment.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Inversión Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">€{roiAnalytics?.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Ingresos Generados</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Canales */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Top Canales por ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roiAnalytics?.channelROI.slice(0, 4).map((channel, index) => (
                <div key={channel.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="font-medium">{channel.channel}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{channel.roi}%</div>
                    <div className="text-xs text-gray-500">{channel.leads} leads</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📧 Email Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Open Rate:</span>
                <span className="font-bold">{marketingMetrics?.emailOpenRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Click Rate:</span>
                <span className="font-bold">{marketingMetrics?.emailClickRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Completion:</span>
                <span className="font-bold">{marketingMetrics?.sequenceCompletionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Conversión Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {marketingMetrics?.leadConversionRate.toFixed(1)}%
            </div>
            <p className="text-gray-600">Visitante → Lead</p>
            <div className="mt-2 text-sm">
              {marketingMetrics?.totalLeads} leads de {marketingMetrics?.totalVisitors} visitantes
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingHubOverviewTab;
