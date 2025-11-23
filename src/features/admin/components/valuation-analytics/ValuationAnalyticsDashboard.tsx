import React, { useState } from 'react';
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

export const ValuationAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  const getDateRange = () => {
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
  };

  const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics, error: errorAnalytics, refetch: refetchAnalytics } = useValuationAnalytics(getDateRange());
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {isUnauthorized ? 'Sin permisos de acceso' : 'Error al cargar analytics'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isUnauthorized 
                ? 'No tienes permisos para ver estas analytics. Asegúrate de que tu usuario está marcado como admin en Supabase.'
                : `Ocurrió un error al cargar los datos: ${errorMessage}`
              }
            </p>
            <Button variant="outline" onClick={() => refetchAnalytics()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
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
