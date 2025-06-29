
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="loading-title"></div>
            <div className="loading-skeleton h-4 w-96"></div>
          </div>
          <div className="dashboard-grid-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="loading-card"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <DashboardHeader />
      <div className="space-y-6">
        <DashboardMetrics stats={stats} />
        <DashboardCharts />
        <DashboardActivity />
      </div>
    </div>
  );
};

export default AdminDashboardHome;
