
import React from 'react';
import EnhancedDashboardStats from './dashboard/EnhancedDashboardStats';
import ActivityFeed from './dashboard/ActivityFeed';
import PerformanceChart from './dashboard/PerformanceChart';
import QuickActionsGrid from './dashboard/QuickActionsGrid';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 bg-gray-50 min-h-screen">
        {/* Header Skeleton */}
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="space-y-3">
            <div className="h-8 bg-gray-100 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-96 animate-pulse"></div>
          </div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Header mejorado */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de Control</h1>
              <p className="text-gray-600">
                Bienvenido al centro de administración de Capittal
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Último acceso</p>
                <p className="text-sm font-medium text-gray-900">Hoy, 09:30</p>
              </div>
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-7xl mx-auto">
        {/* Stats Cards mejoradas */}
        <EnhancedDashboardStats stats={stats} />
        
        {/* Gráfico de Performance */}
        <PerformanceChart />
        
        {/* Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actividad Reciente - 2/3 del ancho */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          
          {/* Estadísticas Rápidas - 1/3 del ancho */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Leads este mes</span>
                  <span className="text-lg font-bold text-blue-600">247</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Conversión</span>
                  <span className="text-lg font-bold text-green-600">12.5%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tiempo respuesta</span>
                  <span className="text-lg font-bold text-purple-600">2.3h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Acciones Rápidas mejoradas */}
        <QuickActionsGrid />
      </div>
    </div>
  );
};

export default AdminDashboardHome;
