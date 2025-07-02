
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import { useAdminDebug } from '@/hooks/useAdminDebug';
import { RoleBasedSidebar } from './RoleBasedSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './layout/AdminBreadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  const { breadcrumbs } = useAdminLayout();
  const { debugInfo } = useAdminDebug();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <RoleBasedSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header global con trigger siempre visible */}
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-card border-b border-border shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <AdminHeader onLogout={onLogout} />
            </div>
          </header>

          {/* Breadcrumbs */}
          <div className="px-6 py-3 bg-card border-b border-border/50">
            <AdminBreadcrumbs items={breadcrumbs} />
          </div>

          {/* Contenido principal */}
          <main className="flex-1 p-6 overflow-auto bg-background">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
