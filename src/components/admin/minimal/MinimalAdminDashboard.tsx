
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import MinimalSidebar from './MinimalSidebar';
import MinimalHeader from './MinimalHeader';
import MinimalDashboardHome from './MinimalDashboardHome';
import AdminDashboardHome from '../AdminDashboardHome';

interface MinimalAdminDashboardProps {
  onLogout: () => void;
}

const MinimalAdminDashboard = ({ onLogout }: MinimalAdminDashboardProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50/30">
        <MinimalSidebar />
        
        <SidebarInset className="flex-1">
          <MinimalHeader onLogout={onLogout} />
          
          <main className="pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-6">
              <Routes>
                <Route index element={<MinimalDashboardHome />} />
                <Route path="classic" element={<AdminDashboardHome />} />
              </Routes>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MinimalAdminDashboard;
