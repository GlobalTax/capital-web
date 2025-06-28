
import React from 'react';
import ModernDashboardStats from './dashboard/ModernDashboardStats';
import ModernQuickActions from './dashboard/ModernQuickActions';
import ModernRecentActivity from './dashboard/ModernRecentActivity';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white border rounded-xl p-6 shadow-lg">
                <div className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 bg-gray-200 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-60"></div>
        <div className="relative p-8 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Dashboard Ejecutivo
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Resumen completo de tu panel de administración Capittal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Modernas */}
      <ModernDashboardStats stats={stats} />
      
      {/* Acciones Rápidas Modernas */}
      <ModernQuickActions />
      
      {/* Actividad Reciente Moderna */}
      <ModernRecentActivity />
    </div>
  );
};

export default AdminDashboardHome;
