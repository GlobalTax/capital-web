
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
      <div className="space-y-8 bg-gray-50 min-h-screen p-8">
        {/* Loading skeletons */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-24 border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-6 h-32 border border-gray-100">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header con métricas */}
      <DashboardHeader 
        totalValuations={stats.valuations}
        todayLeads={todayLeads}
        activeUsers={activeUsers}
      />

      {/* Stats Cards minimalistas */}
      <EnhancedDashboardStats stats={stats} />
      
      {/* Panel de control limpio */}
      <InteractiveControlPanel />
      
      {/* Acciones rápidas simplificadas */}
      <EnhancedQuickActions />
      
      {/* Timeline de actividad */}
      <ActivityTimeline />
    </div>
  );
};

export default AdminDashboardHome;
