
import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import EnhancedDashboardStats from './dashboard/EnhancedDashboardStats';
import InteractiveControlPanel from './dashboard/InteractiveControlPanel';
import EnhancedQuickActions from './dashboard/EnhancedQuickActions';
import ActivityTimeline from './dashboard/ActivityTimeline';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6 bg-gray-50 min-h-screen p-6">
        {/* Loading skeletons */}
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-24">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-40">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calcular métricas para el header
  const todayLeads = 8; // Simulado - podrías calcularlo desde los datos reales
  const activeUsers = 3; // Simulado

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header con métricas en tiempo real */}
      <DashboardHeader 
        totalValuations={stats.valuations}
        todayLeads={todayLeads}
        activeUsers={activeUsers}
      />

      {/* Stats Cards mejoradas con gráficos */}
      <EnhancedDashboardStats stats={stats} />
      
      {/* Panel de control interactivo con gráficos */}
      <InteractiveControlPanel />
      
      {/* Acciones rápidas mejoradas */}
      <EnhancedQuickActions />
      
      {/* Timeline de actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <ActivityTimeline />
      </div>
    </div>
  );
};

export default AdminDashboardHome;
