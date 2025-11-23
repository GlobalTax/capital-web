import React, { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useValuationAnalytics } from '@/hooks/useValuationAnalytics';
import { useSessionMonitoring } from '@/hooks/useSessionMonitoring';
import { ValuationKPICards } from './ValuationKPICards';
import { ConversionFunnelChart } from './ConversionFunnelChart';
import { ActiveSessionsTable } from './ActiveSessionsTable';
import { RecoveryAnalytics } from './RecoveryAnalytics';
import { FieldHeatmap } from './FieldHeatmap';
import { QuickActions } from './QuickActions';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorFallback } from '@/shared/components/ErrorFallback';

export const ValuationAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Memoized date range - only recalculates when dateRange state changes
  const computedDateRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }
    
    return { start, end };
  }, [dateRange]);

  const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics, error: errorAnalytics, refetch: refetchAnalytics } = useValuationAnalytics(computedDateRange);
  const { data: sessions, isLoading: isLoadingSessions, refetch: refetchSessions } = useSessionMonitoring();

  const isLoading = isLoadingAnalytics || isLoadingSessions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (isErrorAnalytics) {
    const errorMessage = errorAnalytics?.message || 'Error desconocido';
    const isUnauthorized = errorMessage.includes('Unauthorized') || errorMessage.includes('permission');
    
    return (
      <ErrorFallback
        title={isUnauthorized ? 'Sin permisos de acceso' : 'Error al cargar analytics'}
        message={isUnauthorized 
          ? 'No tienes permisos para ver estas analytics. Asegúrate de estar autenticado correctamente.'
          : `Ocurrió un error al cargar los datos: ${errorMessage}`
        }
        onRetry={refetchAnalytics}
        showRetry={true}
        className="min-h-[400px]"
      />
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Valoraciones & Recuperación</h1>
          <p className="text-muted-foreground">
            Dashboard completo de analíticas de valoraciones y sesiones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rango de fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            refetchAnalytics();
            refetchSessions();
          }}>
            Refrescar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <ValuationKPICards kpis={analytics.kpis} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Funnel & Recovery */}
        <div className="lg:col-span-2 space-y-6">
          <ConversionFunnelChart funnel={analytics.funnel} />
          <ActiveSessionsTable sessions={sessions || []} onRefresh={refetchSessions} />
        </div>

        {/* Right Column - Recovery & Actions */}
        <div className="space-y-6">
          <RecoveryAnalytics recovery={analytics.recovery} />
          <QuickActions />
        </div>
      </div>

      {/* Field Heatmap - Full Width */}
      <FieldHeatmap fieldInteractions={analytics.fieldInteractions} />
    </div>
  );
};
