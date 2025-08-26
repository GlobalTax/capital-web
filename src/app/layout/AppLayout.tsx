// ============= APP LAYOUT =============
// Main application layout wrapper

import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isOnline } = useNetworkStatus();
  const { preferences } = useAccessibility();
  
  // Navegación predictiva
  usePredictiveNavigation({
    enabled: true,
    confidenceThreshold: 0.6,
    maxPredictions: 3
  });

  // Initialize app features
  useEffect(() => {
    const initializeFeatures = async () => {
      try {
        // Service worker registration (delayed)
        setTimeout(async () => {
          try {
            if ('serviceWorker' in navigator) {
              await navigator.serviceWorker.register('/sw.js');
              console.log('Service worker registered successfully');
            }
          } catch (error) {
            console.warn('Service worker registration failed:', error);
          }
        }, 2000);

        // Performance analytics (delayed)
        setTimeout(async () => {
          try {
            const { performanceAnalytics } = await import('@/utils/performanceAnalytics');
            const handleRouteChange = () => {
              performanceAnalytics.recordPageView(window.location.pathname);
            };
            window.addEventListener('popstate', handleRouteChange);
            handleRouteChange();
            return () => window.removeEventListener('popstate', handleRouteChange);
          } catch (error) {
            console.warn('Failed to initialize performance analytics:', error);
          }
        }, 1000);
      } catch (error) {
        console.warn('Some features failed to initialize:', error);
      }
    };

    initializeFeatures();
  }, []);

  if (!isOnline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }

  return (
    <div className={`min-h-screen bg-background font-sans antialiased font-size-${preferences.fontSize}`}>
      <Suspense fallback={<PageLoadingSkeleton />}>
        {children}
      </Suspense>
      <Toaster />
    </div>
  );
};