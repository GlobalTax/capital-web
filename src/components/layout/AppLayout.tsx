
import React from 'react';
import AdminSidebar from '../admin/AdminSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const AppLayout = ({ children, sidebarCollapsed = false, onToggleSidebar }: AppLayoutProps) => {
  return (
    <div className="app-layout">
      <AdminSidebar collapsed={sidebarCollapsed} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-72'}`}>
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
