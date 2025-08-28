
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppProviders } from '@/core/app/AppProviders';
import { AppRouter } from '@/core/router/AppRouter';
import { HostRedirectService } from '@/core/routing/HostRedirectService';
import { AnalyticsBootstrap } from '@/core/analytics/AnalyticsBootstrap';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';

// Core application components moved to separate modules

// Componente principal con manejo de red y routing
function AppContent() {
  const { isOnline } = useNetworkStatus();
  const { preferences } = useAccessibility();
  
  // Navegación predictiva (dentro del Router context)
  usePredictiveNavigation({
    enabled: true,
    confidenceThreshold: 0.6,
    maxPredictions: 3
  });

  if (!isOnline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }

  // Check for host-based redirections
  const redirectTarget = HostRedirectService.checkRedirection();
  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  return (
    <div className={`min-h-screen bg-background font-sans antialiased font-size-${preferences.fontSize}`}>
      <AppRouter />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Inicialización simplificada y optimizada
    const initializeFeatures = async () => {
      try {
        // Solo en desarrollo: optimizaciones de bundle
        if (process.env.NODE_ENV === 'development') {
          const { logBundleSize, monitorResourceLoading } = await import('./utils/bundleAnalysis');
          logBundleSize();
          monitorResourceLoading();
        }

        // Inicializar service worker de forma diferida
        setTimeout(async () => {
          try {
            if ('serviceWorker' in navigator) {
              await navigator.serviceWorker.register('/sw.js');
            }
          } catch (error) {
            // Silent fail for service worker
          }
        }, 2000);

        // Precargar módulos críticos de forma diferida
        setTimeout(async () => {
          try {
            Promise.all([
              import('./components/admin/lazy'),
              import('./features/dashboard/hooks/useMarketingMetrics'),
            ]).catch(() => {
              // Silent fail for module preloading
            });
          } catch (error) {
            // Silent fail for preloading initialization
          }
        }, 3000);

        // Inicializar analytics
        await AnalyticsBootstrap.initialize();

      } catch (error) {
        // Silent fail for feature initialization
      }
    };

    initializeFeatures();
  }, []);

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
