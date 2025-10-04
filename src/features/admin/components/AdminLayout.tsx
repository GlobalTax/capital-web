
import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import { useAdminDebug } from '@/hooks/useAdminDebug';
import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar';
import { EmergencyNavigation } from '@/components/admin/EmergencyNavigation';
import AdminHeader from '@/components/admin/AdminHeader';
import { ErrorBoundaryProvider } from '@/components/admin/ErrorBoundaryProvider';
import { resetWebSocketState } from '@/utils/resetWebSocketState';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  useAdminLayout();
  const { debugInfo } = useAdminDebug();
  const [showEmergencyNav, setShowEmergencyNav] = useState(false);

  // Detect WebSocket issues and offer emergency navigation
  useEffect(() => {
    // ⚡ OPTIMIZACIÓN: Desregistrar Service Worker si está deshabilitado
    const shouldDisableSW = import.meta.env.VITE_DISABLE_SW === '1';
    if (shouldDisableSW && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          Promise.all(registrations.map(r => r.unregister())).catch(() => {});
        }
      }).catch(() => {});
    }

    // Clear any existing WebSocket state immediately
    try {
      const keys = Object.keys(localStorage);
      const hasRealtimeKeys = keys.some(key => 
        key.includes('realtime') || 
        key.includes('websocket') || 
        key.includes('push-state')
      );
      
      if (hasRealtimeKeys) {
        keys.forEach(key => {
          if (key.includes('realtime') || key.includes('websocket') || key.includes('push-state')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing WebSocket state:', error);
    }

    // Monitor for WebSocket errors and show emergency navigation
    const errorCount = localStorage.getItem('websocket-error-count');
    if (errorCount && parseInt(errorCount) > 5) {
      setShowEmergencyNav(true);
    }

    // Listen for WebSocket errors in console
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('WebSocket') || errorMessage.includes('502')) {
        setShowEmergencyNav(true);
        const currentCount = parseInt(localStorage.getItem('websocket-error-count') || '0');
        localStorage.setItem('websocket-error-count', (currentCount + 1).toString());
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const handleForceNavigate = (path: string) => {
    console.log(`🚀 Force navigating to: ${path}`);
    window.location.href = path;
  };

  return (
    <ErrorBoundaryProvider>
      {showEmergencyNav && (
        <EmergencyNavigation onForceNavigate={handleForceNavigate} />
      )}
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

            {/* Contenido principal */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-background">
              <div className="max-w-[1200px] mx-auto">
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
