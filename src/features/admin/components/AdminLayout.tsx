import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAdminLayout } from '@/hooks/useAdminLayout';
import { useAdminDebug } from '@/hooks/useAdminDebug';
import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar';
import { EmergencyNavigation } from '@/components/admin/EmergencyNavigation';
import LinearAdminHeader from '@/components/admin/header/LinearAdminHeader';
import { AdminErrorBoundary } from '@/features/admin/components/AdminErrorBoundary';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { KeyboardShortcutsHelp } from '@/components/admin/KeyboardShortcutsHelp';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout = ({ children, onLogout }: AdminLayoutProps) => {
  useAdminLayout();
  const { debugInfo } = useAdminDebug();
  const [showEmergencyNav, setShowEmergencyNav] = useState(false);
  
  // Enable global keyboard shortcuts
  useGlobalShortcuts();

  // Detect WebSocket issues and offer emergency navigation
  useEffect(() => {
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
      
      // Auto-reset: Si han pasado más de 10 minutos sin errores, resetear contador
      const lastError = parseInt(localStorage.getItem('websocket-last-error') || '0');
      const now = Date.now();
      if (lastError && now - lastError > 600000) {
        localStorage.removeItem('websocket-error-count');
        localStorage.removeItem('websocket-last-error');
      }
    } catch (error) {
      console.error('Error clearing WebSocket state:', error);
    }

    // Monitor for critical WebSocket errors (more strict check)
    const errorCount = parseInt(localStorage.getItem('websocket-error-count') || '0');
    const lastError = parseInt(localStorage.getItem('websocket-last-error') || '0');
    const now = Date.now();
    
    // Solo mostrar si hay más de 10 errores Y son recientes (últimos 5 minutos)
    if (errorCount > 10 && lastError && now - lastError < 300000) {
      setShowEmergencyNav(true);
    }

    // Listen for critical WebSocket errors in console (less aggressive)
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      
      // Solo detectar errores críticos de WebSocket, no warnings generales
      const isCriticalWebSocketError = 
        (errorMessage.includes('WebSocket') && errorMessage.includes('failed')) ||
        errorMessage.includes('502 Bad Gateway') ||
        errorMessage.includes('WebSocket connection closed unexpectedly');
      
      if (isCriticalWebSocketError) {
        const lastErrorTime = parseInt(localStorage.getItem('websocket-last-error') || '0');
        const currentTime = Date.now();
        
        // Solo incrementar si no hemos tenido errores en los últimos 5 segundos (evitar spam)
        if (!lastErrorTime || currentTime - lastErrorTime > 5000) {
          localStorage.setItem('websocket-last-error', currentTime.toString());
          const currentCount = parseInt(localStorage.getItem('websocket-error-count') || '0');
          localStorage.setItem('websocket-error-count', (currentCount + 1).toString());
          
          // Umbral más alto: 10 errores antes de mostrar popup
          if (currentCount + 1 > 10) {
            setShowEmergencyNav(true);
          }
        }
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
    <AdminErrorBoundary>
      {showEmergencyNav && (
        <EmergencyNavigation 
          onForceNavigate={handleForceNavigate} 
          onDismiss={() => setShowEmergencyNav(false)}
        />
      )}
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen min-h-[100dvh] flex w-full bg-[hsl(var(--linear-bg))]">
          <AdminSidebar />
          
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            {/* Unified Linear Header - 48px */}
            <LinearAdminHeader onLogout={onLogout} />
            
            {/* Command Palette - Global Search (Cmd+K) */}
            <CommandPalette />
            
            {/* Keyboard Shortcuts Help Dialog */}
            <KeyboardShortcutsHelp />

            {/* Main content area - responsive padding */}
            <main className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden flex flex-col">
              <div className="flex-1 min-h-0 w-full max-w-full flex flex-col">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AdminErrorBoundary>
  );
};

export default AdminLayout;
