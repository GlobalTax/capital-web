
import React from 'react';
import ModernDashboardStats from './dashboard/ModernDashboardStats';
import ModernQuickActions from './dashboard/ModernQuickActions';
import ModernRecentActivity from './dashboard/ModernRecentActivity';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-4 bg-white">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-100 rounded w-48 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded p-3">
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-gray-100 rounded w-40 animate-pulse"></div>
          <div className="bg-white border border-gray-100 rounded p-4">
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1 p-2">
                  <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                  <div className="h-2 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white">
      {/* Header compacto */}
      <div>
        <h1 className="text-2xl font-bold text-black mb-1">Dashboard Ejecutivo</h1>
        <p className="text-sm text-gray-600">
          Resumen completo de tu panel de administración Capittal
        </p>
      </div>

      {/* Stats Cards Compactas */}
      <ModernDashboardStats stats={stats} />
      
      {/* Acciones Rápidas Compactas */}
      <ModernQuickActions />
      
      {/* Actividad Reciente Compacta */}
      <ModernRecentActivity />
    </div>
  );
};

export default AdminDashboardHome;
