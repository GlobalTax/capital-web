
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  MousePointer,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AdConversion, AttributionTouchpoint } from '@/types/integrations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface GoogleAdsAttributionTabProps {
  adConversions: AdConversion[];
  touchpoints: AttributionTouchpoint[];
}

const GoogleAdsAttributionTab = ({ adConversions, touchpoints }: GoogleAdsAttributionTabProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalValue = adConversions.reduce((sum, conv) => sum + conv.conversion_value, 0);
    const totalConversions = adConversions.length;
    const avgConversionValue = totalConversions > 0 ? totalValue / totalConversions : 0;
    
    // Group by campaign
    const campaignMetrics = adConversions.reduce((acc, conv) => {
      const campaign = conv.utm_campaign || 'Sin campaña';
      if (!acc[campaign]) {
        acc[campaign] = { conversions: 0, value: 0 };
      }
      acc[campaign].conversions += 1;
      acc[campaign].value += conv.conversion_value;
      return acc;
    }, {} as Record<string, { conversions: number; value: number }>);

    // Calculate ROAS (assuming cost data would come from Google Ads API)
    const estimatedCost = totalValue * 0.25; // Assuming 25% cost ratio for demo
    const roas = estimatedCost > 0 ? totalValue / estimatedCost : 0;

    return {
      totalValue,
      totalConversions,
      avgConversionValue,
      campaignMetrics,
      estimatedCost,
      roas
    };
  }, [adConversions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayConversions = adConversions.filter(conv => 
        conv.created_at.startsWith(date)
      );
      
      return {
        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        conversions: dayConversions.length,
        value: dayConversions.reduce((sum, conv) => sum + conv.conversion_value, 0)
      };
    });
  }, [adConversions]);

  const topCampaigns = Object.entries(metrics.campaignMetrics)
    .sort(([,a], [,b]) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Valor de conversiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalConversions}</div>
            <p className="text-xs text-muted-foreground">Total de conversiones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Math.round(metrics.avgConversionValue)}</div>
            <p className="text-xs text-muted-foreground">Por conversión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROAS</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.roas.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">Retorno de inversión</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance de Google Ads - Últimos 30 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'conversions' ? value : `€${value}`,
                    name === 'conversions' ? 'Conversiones' : 'Valor'
                  ]}
                />
                <Bar yAxisId="left" dataKey="conversions" fill="#3b82f6" name="conversions" />
                <Line yAxisId="right" type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="value" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Campañas por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map(([campaign, data], index) => (
                <div key={campaign} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{campaign}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{data.conversions} conv.</Badge>
                      <span className="font-semibold">€{data.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(data.value / metrics.totalValue) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attribution Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Multi-Touch Attribution</span>
                </div>
                <p className="text-sm text-blue-700">
                  {touchpoints.length} touchpoints identificados en el customer journey.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Performance Trend</span>
                </div>
                <p className="text-sm text-green-700">
                  ROAS promedio de {metrics.roas.toFixed(1)}x indica buena performance de las campañas.
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Optimización</span>
                </div>
                <p className="text-sm text-orange-700">
                  Considera aumentar presupuesto en campañas con ROAS mayor a 4x.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversions */}
      <Card>
        <CardHeader>
          <CardTitle>Conversiones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {adConversions.slice(0, 10).map((conversion) => (
              <div key={conversion.id} className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={conversion.gclid ? "default" : "secondary"}>
                      {conversion.conversion_type}
                    </Badge>
                    {conversion.utm_campaign && (
                      <span className="text-sm text-muted-foreground">
                        {conversion.utm_campaign}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversion.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">€{conversion.conversion_value}</div>
                  {conversion.company_domain && (
                    <div className="text-xs text-muted-foreground">
                      {conversion.company_domain}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAdsAttributionTab;
