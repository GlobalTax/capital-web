import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
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

        // SERVICE WORKER STABILIZATION: Solo una vez por sesión
        const swCleanupKey = 'capittal-sw-cleanup-done';
        const shouldCleanSW = !sessionStorage.getItem(swCleanupKey);
        
        if (shouldCleanSW && import.meta.env.VITE_DISABLE_SW === "1") {
          console.log('🧹 INITIATING SW STABILIZATION - One-time cleanup');
          sessionStorage.setItem(swCleanupKey, 'true');
          
          setTimeout(async () => {
            try {
              if ('serviceWorker' in navigator) {
                console.log('🔧 Unregistering all existing service workers...');
                
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                  await registration.unregister();
                  console.log('✅ Service worker unregistered:', registration.scope);
                }
              }
              
              // Clear ALL browser caches
              if ('caches' in window) {
                console.log('🗑️ Clearing all browser caches...');
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                console.log('✅ All caches cleared');
              }

              console.log('✅ SW stabilization complete');
            } catch (error) {
              console.warn('⚠️ SW cleanup failed:', error);
            }
          }, 100);
        }

        // Debug environment info
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