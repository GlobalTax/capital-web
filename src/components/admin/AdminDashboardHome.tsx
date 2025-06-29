
import React from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardMetrics from './dashboard/DashboardMetrics';
import DashboardCharts from './dashboard/DashboardCharts';
import DashboardActivity from './dashboard/DashboardActivity';

const AdminDashboardHome = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 lg:p-6">
        <div className="space-y-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="w-full p-4 lg:p-6 space-y-6">
        <DashboardHeader />
        <DashboardMetrics stats={stats} />
        <DashboardCharts />
        <DashboardActivity />
      </div>
    </div>
  );
};

export default AdminDashboardHome;
