
import { Suspense, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { PageLoadingSkeleton } from '@/components/LoadingStates';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';
import * as Pages from '@/config/routes';

// All components now imported from routes config

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        // No reintentar errores de red específicos
        if (error?.status === 404 || error?.status === 403) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

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

  if (!isOnline) {
    return <OfflineState onRetry={() => window.location.reload()} />;
  }

  // Redirección por host a rutas específicas
  if (typeof window !== 'undefined') {
    const rawHost = window.location.hostname;
    const host = rawHost.replace(/^www\./, '');
    const path = window.location.pathname;

    // Si entran por calculadoras.capittal.es, forzamos dominio canónico capittal.es/lp/calculadora
    if (host === 'calculadoras.capittal.es' || host === 'calculadora.capittal.es') {
      const canonical = 'https://capittal.es/lp/calculadora';
      if (window.location.href !== canonical) {
        window.location.replace(canonical); // 302 en cliente (efecto similar a 301 para UX)
        return null;
      }
    }

    // Redirecciones internas por host -> ruta (si en el mismo dominio)
    const hostRedirects: Record<string, string> = {
      'webcapittal.lovable.app': '/lp/calculadora',
    };

    const target = hostRedirects[host];
    if (target && path !== target) {
      return <Navigate to={target} replace />;
    }
  }

  return (
    <div className={`min-h-screen bg-background font-sans antialiased font-size-${preferences.fontSize}`}>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Pages.Index />} />
          <Route path="/auth" element={<Pages.AuthPage />} />
          <Route path="/admin/*" element={<Pages.Admin />} />
          
          {/* Core business pages */}
          <Route path="/venta-empresas" element={<Pages.VentaEmpresas />} />
          <Route path="/compra-empresas" element={<Pages.CompraEmpresas />} />
          <Route path="/contacto" element={<Pages.Contacto />} />
          <Route path="/programa-colaboradores" element={<Pages.ProgramaColaboradores />} />
          <Route path="/casos-exito" element={<Pages.CasosExito />} />
          <Route path="/nosotros" element={<Pages.Nosotros />} />
          <Route path="/equipo" element={<Pages.Equipo />} />
          
          {/* Calculator routes - all redirect to V4 via landing page */}
          <Route path="/calculadora-valoracion" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/calculadora-valoracion-v2" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/calculadora-valoracion-v3" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/calculadora-standalone" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/calculadora-master" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/simulador-venta/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/simulador-ultra-rapido/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
          
          {/* Landing Pages - V4 calculator */}
          <Route path="/lp" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/lp/*" element={<Navigate to="/lp/calculadora" replace />} />
          <Route path="/lp/calculadora" element={<Pages.LandingCalculator />} />
          <Route path="/lp/calculadora/*" element={<Pages.LandingCalculator />} />
          <Route path="/lp/calculadora-fiscal" element={<Pages.LandingCalculadoraFiscal />} />
          <Route path="/lp/calculadora-fiscal/*" element={<Pages.LandingCalculadoraFiscal />} />
          <Route path="/lp/reservar-cita" element={<Pages.BookingPage />} />
          
          {/* Service routes */}
          <Route path="/servicios/valoraciones" element={<Pages.Valoraciones />} />
          <Route path="/servicios/venta-empresas" element={<Pages.VentaEmpresas />} />
          <Route path="/servicios/due-diligence" element={<Pages.DueDiligence />} />
          <Route path="/servicios/asesoramiento-legal" element={<Pages.AsesoramientoLegal />} />
          <Route path="/servicios/reestructuraciones" element={<Pages.Reestructuraciones />} />
          <Route path="/servicios/planificacion-fiscal" element={<Pages.PlanificacionFiscal />} />
          
          {/* Legal routes */}
          <Route path="/politica-privacidad" element={<Pages.PoliticaPrivacidad />} />
          <Route path="/terminos-uso" element={<Pages.TerminosUso />} />
          <Route path="/cookies" element={<Pages.Cookies />} />
          
          {/* 404 route */}
          <Route path="*" element={<Pages.NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Simplified initialization
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
            const { performanceAnalytics } = await import('./utils/performanceAnalytics');
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

  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <LeadTrackingProvider enabled={true}>
                <AppContent />
              </LeadTrackingProvider>
              <Toaster />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  );
}

export default App;
