
import React, { useEffect } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import { useAdminDebug } from '@/hooks/useAdminDebug';
import { AdminSidebar } from './sidebar/AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminBreadcrumbs from './layout/AdminBreadcrumbs';
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider';
import { resetWebSocketState } from '@/utils/resetWebSocketState';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  const { breadcrumbs } = useAdminLayout();
  const { debugInfo } = useAdminDebug();

  // Reset WebSocket state on mount to clear any problematic connections
  useEffect(() => {
    // Check for persistent WebSocket errors in console
    const hasWebSocketErrors = performance.getEntriesByType('navigation').length > 0;
    
    // Clear any existing WebSocket state that might be causing issues
    try {
      const keys = Object.keys(localStorage);
      const hasRealtimeKeys = keys.some(key => 
        key.includes('realtime') || 
        key.includes('websocket') || 
        key.includes('push-state')
      );
      
      if (hasRealtimeKeys) {
        console.log('🧹 Clearing problematic WebSocket state...');
        keys.forEach(key => {
          if (key.includes('realtime') || key.includes('websocket') || key.includes('push-state')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing WebSocket state:', error);
    }
  }, []);

  return (
    <ErrorBoundaryProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
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
    </ErrorBoundaryProvider>
  );
};

export default AdminLayout;
