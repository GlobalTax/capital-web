
import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Users, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface OptimizedMarketingOverviewTabProps {
  metrics: any;
  companies: any[];
  events: any[];
  summary: any;
  alerts: any[];
  markAlertAsRead: (alertId: string) => void;
}

// Componente de KPI memoizado
const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));

KPICard.displayName = 'KPICard';

// Componente de gráfico memoizado
const ConversionChart = memo(({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
});

ConversionChart.displayName = 'ConversionChart';

// Componente de alertas memoizado
const AlertsSection = memo(({ 
  alerts, 
  markAlertAsRead 
}: {
  alerts: any[];
  markAlertAsRead: (alertId: string) => void;
}) => {
  const handleMarkAsRead = useCallback((alertId: string) => {
    markAlertAsRead(alertId);
  }, [markAlertAsRead]);

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No hay alertas activas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.slice(0, 5).map((alert) => (
        <div key={alert.id} className="border-l-4 border-red-400 pl-4 py-2">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{alert.priority?.toUpperCase()}</Badge>
            <span className="text-xs text-gray-500">{alert.type}</span>
          </div>
          <h4 className="font-semibold text-sm mt-1">{alert.title}</h4>
          <p className="text-xs text-gray-600">{alert.description}</p>
          {!alert.isRead && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => handleMarkAsRead(alert.id)}
            >
              Marcar como leída
            </Button>
          )}
        </div>
      ))}
    </div>
  );
});

AlertsSection.displayName = 'AlertsSection';

const OptimizedMarketingOverviewTab = memo(({ 
  metrics,
  companies, 
  events, 
  summary, 
  alerts, 
  markAlertAsRead 
}: OptimizedMarketingOverviewTabProps) => {
  
  // Memoizar los datos de KPIs
  const kpis = useMemo(() => {
    if (!metrics) return [];
    
    return [
      {
        title: 'Visitantes Totales',
        value: metrics.totalVisitors.toLocaleString(),
        icon: Users,
        description: `${metrics.identifiedCompanies} empresas identificadas`
      },
      {
        title: 'Leads Generados',
        value: metrics.totalLeads.toLocaleString(),
        icon: TrendingUp,
        description: `${metrics.qualifiedLeads} calificados`
      },
      {
        title: 'Vistas de Contenido',
        value: metrics.contentMetrics.totalViews.toLocaleString(),
        icon: Eye,
        description: `${metrics.contentMetrics.totalPosts} posts publicados`
      },
      {
        title: 'Tasa de Conversión',
        value: `${metrics.leadConversionRate.toFixed(1)}%`,
        icon: TrendingUp,
        description: `Score promedio: ${metrics.averageLeadScore}`
      }
    ];
  }, [metrics]);

  // Memoizar datos del gráfico
  const chartData = useMemo(() => {
    if (!metrics) return [];
    
    return [
      { stage: 'Visitantes', count: metrics.totalVisitors },
      { stage: 'Leads', count: metrics.totalLeads },
      { stage: 'Calificados', count: metrics.qualifiedLeads },
      { stage: 'Calientes', count: metrics.leadScoring.hotLeads }
    ];
  }, [metrics]);

  if (!metrics) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Gráfico de Conversión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Embudo de Conversión</CardTitle>
          </CardHeader>
          <CardContent>
            <ConversionChart data={chartData} />
          </CardContent>
        </Card>

        {/* Métricas de Lead Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Scoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Leads Calientes</span>
                <Badge variant="destructive">{metrics.leadScoring.hotLeads}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Leads Medios</span>
                <Badge variant="secondary">{metrics.leadScoring.mediumLeads}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Leads Fríos</span>
                <Badge variant="outline">{metrics.leadScoring.coldLeads}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tasa de Conversión</span>
                  <span className="text-sm">{metrics.leadScoring.conversionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Alertas Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsSection alerts={alerts} markAlertAsRead={markAlertAsRead} />
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedMarketingOverviewTab.displayName = 'OptimizedMarketingOverviewTab';

export default OptimizedMarketingOverviewTab;
