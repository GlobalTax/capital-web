
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { PageLoadingSkeleton } from '@/components/LoadingStates';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { OfflineState } from '@/components/EmptyStates';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logBundleSize, preloadCriticalChunks, monitorResourceLoading } from '@/utils/bundleAnalysis';
import { useEffect } from 'react';
import { usePredictiveNavigation } from '@/hooks/usePredictiveNavigation';


import { APP_CONFIG } from '@/core/constants/app-config';
// Lazy loading components - Core pages
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
const CalculadoraValoracion = lazy(() => import('@/pages/CalculadoraValoracion'));
const CalculadoraValoracionV2 = lazy(() => import('@/pages/CalculadoraValoracionV2'));
const CalculadoraValoracionV3 = lazy(() => import('@/pages/CalculadoraValoracionV3'));
const CalculadoraValoracionV4 = lazy(() => import('@/pages/CalculadoraValoracionV4'));
const CalculadoraStandalone = lazy(() => import('@/pages/CalculadoraStandalone'));
const LandingCalculadora = lazy(() => import('@/pages/LandingCalculadora'));
const CalculadorasSectores = lazy(() => import('@/pages/CalculadorasSectores'));
const SectorPage = lazy(() => import('@/pages/sectores/SectorPage'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
const CasosExito = lazy(() => import('@/pages/CasosExito'));
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const Equipo = lazy(() => import('@/pages/Equipo'));
const DocumentacionMA = lazy(() => import('@/pages/DocumentacionMA'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Service pages - Create placeholder components for missing ones
const Valoraciones = lazy(() => import('@/pages/servicios/Valoraciones').catch(() => 
  import('@/pages/VentaEmpresas') // Fallback to existing page
));
const DueDiligence = lazy(() => import('@/pages/servicios/DueDiligence').catch(() => 
  import('@/pages/VentaEmpresas')
));
const AsesoramientoLegal = lazy(() => import('@/pages/servicios/AsesoramientoLegal').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Reestructuraciones = lazy(() => import('@/pages/servicios/Reestructuraciones').catch(() => 
  import('@/pages/VentaEmpresas')
));
const PlanificacionFiscal = lazy(() => import('@/pages/servicios/PlanificacionFiscal').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Sector pages - Create placeholder components for missing ones
const Tecnologia = lazy(() => import('@/pages/sectores/Tecnologia').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Healthcare = lazy(() => import('@/pages/sectores/Healthcare').catch(() => 
  import('@/pages/VentaEmpresas')
));
const FinancialServices = lazy(() => import('@/pages/sectores/FinancialServices').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Industrial = lazy(() => import('@/pages/sectores/Industrial').catch(() => 
  import('@/pages/VentaEmpresas')
));
const RetailConsumer = lazy(() => import('@/pages/sectores/RetailConsumer').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Energia = lazy(() => import('@/pages/sectores/Energia').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Inmobiliario = lazy(() => import('@/pages/sectores/Inmobiliario').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Resource pages - Create placeholder components for missing ones
const Blog = lazy(() => import('@/pages/Blog').catch(() => 
  import('@/pages/VentaEmpresas')
));
const CaseStudies = lazy(() => import('@/pages/recursos/CaseStudies').catch(() => 
  import('@/pages/VentaEmpresas')
));
const MarketReports = lazy(() => import('@/pages/recursos/MarketReports').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Newsletter = lazy(() => import('@/pages/recursos/Newsletter').catch(() => 
  import('@/pages/VentaEmpresas')
));
const LandingPageView = lazy(() => import('@/pages/LandingPageView').catch(() => 
  import('@/pages/NotFound')
));
const Webinars = lazy(() => import('@/pages/recursos/Webinars').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Por que elegirnos pages - Create placeholder components for missing ones
const PorQueElegirnos = lazy(() => import('@/pages/por-que-elegirnos/index').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Experiencia = lazy(() => import('@/pages/por-que-elegirnos/experiencia').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Metodologia = lazy(() => import('@/pages/por-que-elegirnos/metodologia').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Resultados = lazy(() => import('@/pages/por-que-elegirnos/resultados').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Legal pages - Create placeholder components for missing ones
const PoliticaPrivacidad = lazy(() => import('@/pages/PoliticaPrivacidad').catch(() => 
  import('@/pages/VentaEmpresas')
));
const TerminosUso = lazy(() => import('@/pages/TerminosUso').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Cookies = lazy(() => import('@/pages/Cookies').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Dynamic blog post component - Create placeholder for missing one
const BlogPost = lazy(() => import('@/pages/blog/BlogPost').catch(() => 
  import('@/pages/VentaEmpresas')
));

// Documentacion MA pages - Create placeholder components for missing ones
const NuestroMetodo = lazy(() => import('@/pages/documentacion-ma/NuestroMetodo').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Fase1 = lazy(() => import('@/pages/documentacion-ma/Fase1').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Fase2Lucha = lazy(() => import('@/pages/documentacion-ma/Fase2Lucha').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Resultados2 = lazy(() => import('@/pages/documentacion-ma/Resultados').catch(() => 
  import('@/pages/VentaEmpresas')
));
const ConoceEquipo = lazy(() => import('@/pages/documentacion-ma/ConoceEquipo').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Typography = lazy(() => import('@/pages/documentacion-ma/Typography').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Spacing = lazy(() => import('@/pages/documentacion-ma/Spacing').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Variables = lazy(() => import('@/pages/documentacion-ma/Variables').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Customization = lazy(() => import('@/pages/documentacion-ma/Customization').catch(() => 
  import('@/pages/VentaEmpresas')
));
const DynamicComponents = lazy(() => import('@/pages/documentacion-ma/DynamicComponents').catch(() => 
  import('@/pages/VentaEmpresas')
));

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

  return (
    <div className={`min-h-screen bg-background font-sans antialiased font-size-${preferences.fontSize}`}>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/venta-empresas" element={<VentaEmpresas />} />
          <Route path="/compra-empresas" element={<CompraEmpresas />} />
          <Route path="/calculadora-valoracion" element={<CalculadoraValoracion />} />
          <Route path="/calculadora-valoracion-v2" element={<CalculadoraValoracionV2 />} />
          <Route path="/simulador-venta/:clientId" element={<CalculadoraValoracionV3 />} />
          <Route path="/simulador-ultra-rapido/:clientId" element={<CalculadoraValoracionV4 />} />
          <Route path="/calculadora-standalone" element={<CalculadoraStandalone />} />
          <Route path="/calculadora-gratuita" element={<LandingCalculadora />} />
          <Route path="/calculadoras" element={<CalculadorasSectores />} />
          <Route path="/calculadora/:sector" element={<SectorPage />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
          <Route path="/casos-exito" element={<CasosExito />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/documentacion-ma" element={<DocumentacionMA />} />
          
          {/* Service routes */}
          <Route path="/servicios/valoraciones" element={<Valoraciones />} />
          <Route path="/servicios/venta-empresas" element={<VentaEmpresas />} />
          <Route path="/servicios/due-diligence" element={<DueDiligence />} />
          <Route path="/servicios/asesoramiento-legal" element={<AsesoramientoLegal />} />
          <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
          <Route path="/servicios/planificacion-fiscal" element={<PlanificacionFiscal />} />
          
          {/* Sector routes */}
          {APP_CONFIG.FEATURES.SECTORS_ENABLED && (
            <>
              <Route path="/sectores/tecnologia" element={<Tecnologia />} />
              <Route path="/sectores/healthcare" element={<Healthcare />} />
              <Route path="/sectores/financial-services" element={<FinancialServices />} />
              <Route path="/sectores/industrial" element={<Industrial />} />
              <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
              <Route path="/sectores/energia" element={<Energia />} />
              <Route path="/sectores/inmobiliario" element={<Inmobiliario />} />
            </>
          )}
          
          {/* Resource routes */}
          <Route path="/recursos/blog" element={<Blog />} />
          <Route path="/recursos/case-studies" element={<CaseStudies />} />
          <Route path="/recursos/market-reports" element={<MarketReports />} />
          <Route path="/recursos/newsletter" element={<Newsletter />} />
          <Route path="/recursos/webinars" element={<Webinars />} />
          
          {/* Landing Pages */}
          <Route path="/landing/:slug" element={<LandingPageView />} />
          
          {/* Por que elegirnos routes */}
          <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
          <Route path="/por-que-elegirnos/experiencia" element={<Experiencia />} />
          <Route path="/por-que-elegirnos/metodologia" element={<Metodologia />} />
          <Route path="/por-que-elegirnos/resultados" element={<Resultados />} />
          
          {/* Legal routes */}
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-uso" element={<TerminosUso />} />
          <Route path="/cookies" element={<Cookies />} />
          
          {/* Blog post route */}
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Documentacion MA routes */}
          <Route path="/documentacion-ma/nuestro-metodo" element={<NuestroMetodo />} />
          <Route path="/documentacion-ma/fase1" element={<Fase1 />} />
          <Route path="/documentacion-ma/fase2-lucha" element={<Fase2Lucha />} />
          <Route path="/documentacion-ma/resultados" element={<Resultados2 />} />
          <Route path="/documentacion-ma/conoce-equipo" element={<ConoceEquipo />} />
          <Route path="/documentacion-ma/typography" element={<Typography />} />
          <Route path="/documentacion-ma/spacing" element={<Spacing />} />
          <Route path="/documentacion-ma/variables" element={<Variables />} />
          <Route path="/documentacion-ma/customization" element={<Customization />} />
          <Route path="/documentacion-ma/dynamic-components" element={<DynamicComponents />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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

        // Inicializar/gestionar service worker solo en producción
        setTimeout(async () => {
          try {
            if ('serviceWorker' in navigator) {
              if (import.meta.env.PROD) {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service worker registered successfully');
              } else {
                // En desarrollo, asegurarnos de no tener SW que contamine el dev server
                const regs = await navigator.serviceWorker.getRegistrations();
                regs.forEach(r => r.unregister());
                console.log('Service worker unregistered for dev');
              }
            }
          } catch (error) {
            console.warn('Service worker registration failed:', error);
          }
        }, 2000);

        // Precargar chunks críticos de forma diferida
        setTimeout(async () => {
          try {
            const { preloadCriticalChunks } = await import('./utils/bundleAnalysis');
            preloadCriticalChunks();
            
            // Precargar módulos críticos
            Promise.all([
              import('./components/admin/lazy'),
              import('./features/dashboard/hooks/useMarketingMetrics'),
            ]).catch(error => {
              console.warn('Failed to preload some modules:', error);
            });
          } catch (error) {
            console.warn('Failed to initialize preloading:', error);
          }
        }, 3000);

        // Inicializar analytics de rendimiento de forma diferida
        setTimeout(async () => {
          try {
            const { performanceAnalytics } = await import('./utils/performanceAnalytics');
            
            const handleRouteChange = () => {
              performanceAnalytics.recordPageView(window.location.pathname);
            };
            
            window.addEventListener('popstate', handleRouteChange);
            handleRouteChange();

            return () => {
              window.removeEventListener('popstate', handleRouteChange);
            };
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
