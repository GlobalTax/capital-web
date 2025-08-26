import React, { memo, useMemo, useCallback, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertTriangle,
  Activity,
  Brain,
  Settings
} from 'lucide-react';
import { useMarketingMetrics } from '@/features/dashboard/hooks/useMarketingMetrics';
import { LoadingSkeleton, ErrorFallback } from '@/shared';
import { devLogger } from '@/utils/devLogger';

// Lazy loading para componentes pesados
const MarketingOverview = React.lazy(() => import('@/features/dashboard/components/MarketingOverview').then(module => ({ default: module.MarketingOverview })));
const PerformanceDashboard = React.lazy(() => import('./dashboard/PerformanceDashboard'));
const PredictiveAnalytics = React.lazy(() => import('./analytics/PredictiveAnalytics').then(module => ({ default: module.PredictiveAnalytics })));
const AIInsightsPanel = React.lazy(() => import('./dashboard/AIInsightsPanel').then(module => ({ default: module.AIInsightsPanel })));

// Componente de KPIs memoizado
const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
      {trend && (
        <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </Badge>
      )}
    </CardContent>
  </Card>
));

KPICard.displayName = 'KPICard';

// Usar LoadingSkeleton de shared components

// Componente principal memoizado
const UnifiedDashboard = memo(() => {
  const { metrics, isLoading, error } = useMarketingMetrics();

  // Memoizar los KPIs para evitar recalcular
  const kpis = useMemo(() => {
    if (!metrics) return [];
    
    const conversionTrend: 'up' | 'down' | 'neutral' = metrics.leadConversionRate > 2 ? 'up' : 'neutral';
    const scoreTrend: 'up' | 'down' | 'neutral' = metrics.averageLeadScore > 60 ? 'up' : 'neutral';
    
    return [
      {
        title: 'Leads Totales',
        value: metrics.totalLeads.toLocaleString(),
        icon: Users,
        trend: 'up' as const,
        subtitle: `${metrics.qualifiedLeads} calificados`
      },
      {
        title: 'Ingresos',
        value: `€${metrics.totalRevenue.toLocaleString()}`,
        icon: DollarSign,
        trend: 'up' as const,
        subtitle: `${metrics.identifiedCompanies} empresas`
      },
      {
        title: 'Conversión',
        value: `${metrics.leadConversionRate.toFixed(1)}%`,
        icon: TrendingUp,
        trend: conversionTrend,
        subtitle: `${metrics.totalVisitors} visitantes`
      },
      {
        title: 'Score Promedio',
        value: metrics.averageLeadScore,
        icon: Activity,
        trend: scoreTrend,
        subtitle: `${metrics.leadScoring.hotLeads} leads calientes`
      }
    ];
  }, [metrics]);

  // Callback memoizado para el tab change
  const handleTabChange = useCallback((value: string) => {
    devLogger.info(`Dashboard tab changed to: ${value}`, undefined, 'ui');
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <ErrorFallback 
        title="Error al cargar el dashboard"
        message="Ha ocurrido un error al cargar los datos del dashboard."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="overview" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<LoadingSkeleton />}>
            {metrics && <MarketingOverview metrics={metrics} />}
          </Suspense>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PerformanceDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <PredictiveAnalytics />
          </Suspense>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <AIInsightsPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
});

UnifiedDashboard.displayName = 'UnifiedDashboard';

export { UnifiedDashboard };