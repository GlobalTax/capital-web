import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';
import { AppProviders } from '@/core/providers/AppProviders';
import { AppRoutes } from '@/core/routing/AppRoutes';
import { useHostRedirects } from '@/core/routing/HostRedirects';

// Componente principal con manejo de red
function AppContent() {
  const { isOnline } = useNetworkStatus();
  const { preferences } = useAccessibility();
  
  // Navegación predictiva (dentro del Router context)
  usePredictiveNavigation({
    enabled: true,
    confidenceThreshold: 0.6,
    maxPredictions: 3
  });

  // Handle host redirects
  const hostRedirect = useHostRedirects();
  if (hostRedirect) return hostRedirect;

  if (!isOnline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }

  return (
    <div className={`min-h-screen bg-background font-sans antialiased font-size-${preferences.fontSize}`}>
      <AppRoutes />
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Inicialización simplificada y optimizada
    const initializeFeatures = async () => {
      try {
        // Solo en desarrollo: optimizaciones de bundle
        if (import.meta.env.DEV) {
          const { logBundleSize, monitorResourceLoading } = await import('./utils/bundleAnalysis');
          logBundleSize();
          monitorResourceLoading();
        }

        console.log('🚀 App initialized - Environment:', import.meta.env.MODE);
        
      } catch (error) {
        console.error('App initialization error:', error);
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