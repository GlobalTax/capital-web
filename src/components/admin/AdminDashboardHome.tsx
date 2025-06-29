
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
      <div className="admin-page">
        <div className="admin-space-y admin-loading">
          <div className="space-y-3">
            <div className="admin-loading-title"></div>
            <div className="admin-loading-card h-4 w-96"></div>
          </div>
          <div className="admin-grid-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-loading-card h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <DashboardHeader />
      <DashboardMetrics stats={stats} />
      <DashboardCharts />
      <DashboardActivity />
    </div>
  );
};

export default AdminDashboardHome;
