import React from 'react';
import { useOperationsAnalytics } from '../../hooks/useOperationsAnalytics';
import { KPICards } from './KPICards';
import { PipelineChart } from './PipelineChart';
import { ActivityFeed } from './ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const OperationsDashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useOperationsAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error al cargar el dashboard</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Operaciones</h1>
        <p className="text-muted-foreground">
          Análisis completo de operaciones, KPIs y tendencias
        </p>
      </div>

      {/* KPIs */}
      <KPICards kpis={analytics.kpis} />

      {/* Charts and Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <PipelineChart 
            sectorDistribution={analytics.sectorDistribution}
            temporalData={analytics.temporalData}
            topSectors={analytics.topSectors}
          />
        </div>
        <div className="md:col-span-1">
          <ActivityFeed activities={analytics.recentActivity} />
        </div>
      </div>
    </div>
  );
};
