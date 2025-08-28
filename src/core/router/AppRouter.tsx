import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

// Lazy loading components - Core pages
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
const CalculadoraStandalone = lazy(() => import('@/pages/CalculadoraStandalone'));
const CalculadoraMaster = lazy(() => import('@/pages/CalculadoraMaster'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
const CasosExito = lazy(() => import('@/pages/CasosExito'));
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const DeLooperACapittal = lazy(() => import('@/pages/DeLooperACapittal'));
const Equipo = lazy(() => import('@/pages/Equipo'));
const DocumentacionMA = lazy(() => import('@/pages/DocumentacionMA'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AuthPage = lazy(() => import('@/pages/Auth'));

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
const BookingPage = lazy(() => import('@/pages/BookingPage'));
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

// Landing Calculator
const LandingCalculator = lazy(() => import('@/pages/LandingCalculator'));
const LandingCalculadoraFiscal = lazy(() => import('@/pages/LandingCalculadoraFiscal'));

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

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/venta-empresas" element={<VentaEmpresas />} />
        <Route path="/compra-empresas" element={<CompraEmpresas />} />
        <Route path="/calculadora-valoracion" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-valoracion-v2" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-venta/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-ultra-rapido/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-standalone" element={<CalculadoraStandalone />} />
        <Route path="/calculadora-master" element={<CalculadoraMaster />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
        <Route path="/casos-exito" element={<CasosExito />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/de-looper-a-capittal" element={<DeLooperACapittal />} />
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
        
        {/* Landing Pages */}
        <Route path="/landing/:slug" element={<LandingPageView />} />
        <Route path="/lp" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/*" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/calculadora" element={<LandingCalculator />} />
        <Route path="/lp/calculadora/*" element={<LandingCalculator />} />
        <Route path="/lp/calculadora-fiscal" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/calculadora-fiscal/*" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/reservar-cita" element={<BookingPage />} />
        
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
  );
}