import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

// Lazy loading components
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
const CalculadoraValoracion = lazy(() => import('@/pages/CalculadoraValoracion'));
const CalculadoraValoracionV2 = lazy(() => import('@/pages/CalculadoraValoracionV2'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
const CasosExito = lazy(() => import('@/pages/CasosExito'));
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const Equipo = lazy(() => import('@/pages/Equipo'));
const DocumentacionMA = lazy(() => import('@/pages/DocumentacionMA'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Import all service pages
const Valoraciones = lazy(() => import('@/pages/servicios/Valoraciones'));
const VentaEmpresasService = lazy(() => import('@/pages/servicios/VentaEmpresas'));
const DueDiligence = lazy(() => import('@/pages/servicios/DueDiligence'));
const AsesoramientoLegal = lazy(() => import('@/pages/servicios/AsesoramientoLegal'));
const Reestructuraciones = lazy(() => import('@/pages/servicios/Reestructuraciones'));
const PlanificacionFiscal = lazy(() => import('@/pages/servicios/PlanificacionFiscal'));

// Import all sector pages
const Tecnologia = lazy(() => import('@/pages/sectores/Tecnologia'));
const Healthcare = lazy(() => import('@/pages/sectores/Healthcare'));
const FinancialServices = lazy(() => import('@/pages/sectores/FinancialServices'));
const Industrial = lazy(() => import('@/pages/sectores/Industrial'));
const RetailConsumer = lazy(() => import('@/pages/sectores/RetailConsumer'));
const Energia = lazy(() => import('@/pages/sectores/Energia'));
const Inmobiliario = lazy(() => import('@/pages/sectores/Inmobiliario'));

// Import resource pages
const Blog = lazy(() => import('@/pages/recursos/Blog'));
const CaseStudies = lazy(() => import('@/pages/recursos/CaseStudies'));
const MarketReports = lazy(() => import('@/pages/recursos/MarketReports'));
const Newsletter = lazy(() => import('@/pages/recursos/Newsletter'));
const Webinars = lazy(() => import('@/pages/recursos/Webinars'));

// Por que elegirnos pages
const PorQueElegirnos = lazy(() => import('@/pages/por-que-elegirnos/index'));
const Experiencia = lazy(() => import('@/pages/por-que-elegirnos/experiencia'));
const Metodologia = lazy(() => import('@/pages/por-que-elegirnos/metodologia'));
const Resultados = lazy(() => import('@/pages/por-que-elegirnos/resultados'));

// Legal pages
const PoliticaPrivacidad = lazy(() => import('@/pages/PoliticaPrivacidad'));
const TerminosUso = lazy(() => import('@/pages/TerminosUso'));
const Cookies = lazy(() => import('@/pages/Cookies'));

// Dynamic blog post component
const BlogPost = lazy(() => import('@/pages/blog/BlogPost'));

// Documentacion MA pages
const NuestroMetodo = lazy(() => import('@/pages/documentacion-ma/NuestroMetodo'));
const Fase1 = lazy(() => import('@/pages/documentacion-ma/Fase1'));
const Fase2Lucha = lazy(() => import('@/pages/documentacion-ma/Fase2Lucha'));
const Resultados2 = lazy(() => import('@/pages/documentacion-ma/Resultados'));
const ConoceEquipo = lazy(() => import('@/pages/documentacion-ma/ConoceEquipo'));
const Typography = lazy(() => import('@/pages/documentacion-ma/Typography'));
const Spacing = lazy(() => import('@/pages/documentacion-ma/Spacing'));
const Variables = lazy(() => import('@/pages/documentacion-ma/Variables'));
const Customization = lazy(() => import('@/pages/documentacion-ma/Customization'));
const DynamicComponents = lazy(() => import('@/pages/documentacion-ma/DynamicComponents'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/admin/*" element={<Admin />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/venta-empresas" element={<VentaEmpresas />} />
                    <Route path="/compra-empresas" element={<CompraEmpresas />} />
                    <Route path="/calculadora-valoracion" element={<CalculadoraValoracion />} />
                    <Route path="/calculadora-valoracion-v2" element={<CalculadoraValoracionV2 />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
                    <Route path="/casos-exito" element={<CasosExito />} />
                    <Route path="/nosotros" element={<Nosotros />} />
                    <Route path="/equipo" element={<Equipo />} />
                    <Route path="/documentacion-ma" element={<DocumentacionMA />} />
                    
                    {/* Service routes */}
                    <Route path="/servicios/valoraciones" element={<Valoraciones />} />
                    <Route path="/servicios/venta-empresas" element={<VentaEmpresasService />} />
                    <Route path="/servicios/due-diligence" element={<DueDiligence />} />
                    <Route path="/servicios/asesoramiento-legal" element={<AsesoramientoLegal />} />
                    <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
                    <Route path="/servicios/planificacion-fiscal" element={<PlanificacionFiscal />} />
                    
                    {/* Sector routes */}
                    <Route path="/sectores/tecnologia" element={<Tecnologia />} />
                    <Route path="/sectores/healthcare" element={<Healthcare />} />
                    <Route path="/sectores/financial-services" element={<FinancialServices />} />
                    <Route path="/sectores/industrial" element={<Industrial />} />
                    <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
                    <Route path="/sectores/energia" element={<Energia />} />
                    <Route path="/sectores/inmobiliario" element={<Inmobiliario />} />
                    
                    {/* Resource routes */}
                    <Route path="/recursos/blog" element={<Blog />} />
                    <Route path="/recursos/case-studies" element={<CaseStudies />} />
                    <Route path="/recursos/market-reports" element={<MarketReports />} />
                    <Route path="/recursos/newsletter" element={<Newsletter />} />
                    <Route path="/recursos/webinars" element={<Webinars />} />
                    
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
              <Toaster />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  );
}

export default App;
