
import React from 'react';
import ModernDashboardStats from './dashboard/ModernDashboardStats';
import ModernQuickActions from './dashboard/ModernQuickActions';
import ModernRecentActivity from './dashboard/ModernRecentActivity';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 bg-white">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-100 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Stats Skeleton */}
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
        
        {/* Quick Actions Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-100 rounded w-48 animate-pulse"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 p-3 border border-gray-100 rounded-lg">
                  <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header minimalista */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Inicio</h1>
        <p className="text-gray-600 font-light">
          Panel de administración Capittal
        </p>
      </div>

      {/* Stats Cards minimalistas */}
      <ModernDashboardStats stats={stats} />
      
      {/* Acciones Rápidas minimalistas */}
      <ModernQuickActions />
      
      {/* Actividad Reciente minimalista */}
      <ModernRecentActivity />
    </div>
  );
};

export default AdminDashboardHome;
