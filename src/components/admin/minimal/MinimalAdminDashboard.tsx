
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MinimalHeader from './MinimalHeader';
import MinimalDashboardHome from './MinimalDashboardHome';
import AdminDashboardHome from '../AdminDashboardHome';

interface MinimalAdminDashboardProps {
  onLogout: () => void;
}

const MinimalAdminDashboard = ({ onLogout }: MinimalAdminDashboardProps) => {
  return (
    <div className="min-h-screen bg-gray-50/30">
      <MinimalHeader onLogout={onLogout} />
      
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <Routes>
            <Route index element={<MinimalDashboardHome />} />
            <Route path="classic" element={<AdminDashboardHome />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MinimalAdminDashboard;
