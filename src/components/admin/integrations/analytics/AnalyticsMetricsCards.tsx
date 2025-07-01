
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock, TrendingUp, Target } from 'lucide-react';

interface AnalyticsData {
  enrichmentTrends: any[];
  performanceMetrics: any[];
  sourceDistribution: any[];
  successRates: any[];
  responseTimesTrend: any[];
  companyGrowth: any[];
}

interface AnalyticsMetricsCardsProps {
  analyticsData: AnalyticsData | null;
  timeRange: string;
}

const AnalyticsMetricsCards = ({ analyticsData, timeRange }: AnalyticsMetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enriquecimientos Totales</CardTitle>
          <Zap className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData?.enrichmentTrends.reduce((sum, day) => sum + day.total, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Últimos {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} días
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData?.responseTimesTrend.length ? 
              Math.round(analyticsData.responseTimesTrend.reduce((sum, item) => sum + item.tiempo, 0) / analyticsData.responseTimesTrend.length)
              : 0}ms
          </div>
          <p className="text-xs text-muted-foreground">Tiempo de respuesta</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData?.successRates.length ? 
              Math.round(analyticsData.successRates.reduce((sum, item) => sum + parseFloat(item.tasa_exito), 0) / analyticsData.successRates.length)
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">Operaciones exitosas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Accounts</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyticsData?.companyGrowth.reduce((sum, day) => sum + day.target_accounts, 0) || 0}
          </div>
          <p className="text-xs text-muted-foreground">Cuentas objetivo identificadas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsMetricsCards;
