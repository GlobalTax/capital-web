
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
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="space-y-3">
            <div className="bg-gray-200 rounded h-6 w-48"></div>
            <div className="bg-gray-200 rounded h-4 w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <DashboardHeader />
      <DashboardMetrics stats={stats} />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
};

export default AdminDashboardHome;
