
import React from 'react';
import { BarChart3 } from 'lucide-react';
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
          <div className="h-8 bg-gray-100 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-100 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-40 animate-pulse"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 border border-gray-100 rounded">
                  <div className="h-5 w-5 bg-gray-100 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header minimalista */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Ejecutivo</h1>
        </div>
        <p className="text-gray-600">
          Resumen completo de tu panel de administración Capittal
        </p>
      </div>

      {/* Stats Cards Minimalistas */}
      <ModernDashboardStats stats={stats} />
      
      {/* Acciones Rápidas Minimalistas */}
      <ModernQuickActions />
      
      {/* Actividad Reciente Minimalista */}
      <ModernRecentActivity />
    </div>
  );
};

export default AdminDashboardHome;
