
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import { ModernAppSidebar } from './ModernAppSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './layout/AdminBreadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  const { breadcrumbs } = useAdminLayout();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <ModernAppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header global con trigger siempre visible */}
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-white border-b border-gray-200">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <AdminHeader onLogout={onLogout} />
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <AdminBreadcrumbs items={breadcrumbs} />
          </div>

          {/* Contenido principal */}
          <main className="flex-1 p-6 overflow-auto bg-white">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
