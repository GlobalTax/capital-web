
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AppProviders } from '@/core/app/AppProviders';
import { AppRouter } from '@/core/router/AppRouter';
import { HostRedirectService } from '@/core/routing/HostRedirectService';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logError } from '@/core/logging/ConditionalLogger';

// Core application components moved to separate modules

// Componente principal con manejo de red y routing
function AppContent() {
  const { isOnline } = useNetworkStatus();
  const { preferences } = useAccessibility();

  if (!isOnline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }

  // Check for host-based redirections
  const redirectTarget = HostRedirectService.checkRedirection();
  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <AppRouter />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Inicialización simplificada para evitar errores
    const initializeApp = async () => {
      try {
        // Inicializar service worker de forma diferida
        if ('serviceWorker' in navigator) {
          setTimeout(async () => {
            try {
              await navigator.serviceWorker.register('/sw.js');
            } catch (error) {
              // Silent fail for service worker
            }
          }, 3000);
        }
      } catch (error) {
        logError('Error during app initialization', error as Error, {
          context: 'system',
          component: 'App'
        });
      }
    };

    initializeApp();
  }, []);

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
