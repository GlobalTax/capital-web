
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './layout/AdminBreadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  const { breadcrumbs } = useAdminLayout();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader onLogout={onLogout} />
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <AdminBreadcrumbs items={breadcrumbs} />
          </div>
          <main className="flex-1 p-6 overflow-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
