// ============= APP LAYOUT =============
// Main application layout wrapper

import React, { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';
import { PageLoadingSkeleton } from '@/components/LoadingStates';
import { logger } from '@/utils/logger';

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
              logger.info('Service worker registered successfully', undefined, { 
                context: 'system', 
                component: 'AppLayout' 
              });
            }
          } catch (error) {
            logger.warn('Service worker registration failed', error as Error, { 
              context: 'system', 
              component: 'AppLayout' 
            });
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
            logger.warn('Failed to initialize performance analytics', error as Error, { 
              context: 'performance', 
              component: 'AppLayout' 
            });
          }
        }, 1000);
      } catch (error) {
        logger.warn('Some features failed to initialize', error as Error, { 
          context: 'system', 
          component: 'AppLayout' 
        });
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