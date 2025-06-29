
import React from 'react';
import AdvancedDashboardStatsComponent from './dashboard/AdvancedDashboardStats';
import ModernQuickActions from './dashboard/ModernQuickActions';
import ModernRecentActivity from './dashboard/ModernRecentActivity';
import { useAdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const AdminDashboardHome = () => {
  const { 
    stats, 
    isLoading, 
    error, 
    historicalRevenueData,
    historicalContentData,
    refetch, 
    generateSampleData 
  } = useAdvancedDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 bg-white">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="h-64 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-white">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-light">Panel de administración Capittal</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error cargando las métricas del dashboard: {error}
          </AlertDescription>
        </Alert>

        {/* Fallback a componentes básicos */}
        <ModernQuickActions />
        <ModernRecentActivity />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6 bg-white">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-light">Panel de administración Capittal</p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No hay datos disponibles. Genera algunos datos de ejemplo para comenzar.
          </AlertDescription>
        </Alert>

        {/* Fallback a componentes básicos */}
        <ModernQuickActions />
        <ModernRecentActivity />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Dashboard Avanzado con Gráficos */}
      <AdvancedDashboardStatsComponent 
        stats={stats}
        onRefresh={refetch}
        onGenerateSample={generateSampleData}
        isLoading={isLoading}
        historicalRevenueData={historicalRevenueData}
        historicalContentData={historicalContentData}
      />
      
      {/* Acciones Rápidas */}
      <ModernQuickActions />
      
      {/* Actividad Reciente */}
      <ModernRecentActivity />
    </div>
  );
};

export default AdminDashboardHome;
