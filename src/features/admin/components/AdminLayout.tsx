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
    <AdminErrorBoundary>
      {showEmergencyNav && (
        <EmergencyNavigation onForceNavigate={handleForceNavigate} />
      )}
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-[hsl(var(--linear-bg))]">
          <AdminSidebar />
          
          <SidebarInset className="flex-1 flex flex-col">
            {/* Unified Linear Header - 48px */}
            <LinearAdminHeader onLogout={onLogout} />
            
            {/* Command Palette - Global Search (Cmd+K) */}
            <CommandPalette />
            
            {/* Keyboard Shortcuts Help Dialog */}
            <KeyboardShortcutsHelp />

            {/* Main content area */}
            <main className="flex-1 p-4 overflow-auto">
              <div className="w-full">
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
