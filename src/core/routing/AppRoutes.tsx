import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

// === CORE PAGES ===
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AuthPage = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// === BUSINESS PAGES ===
const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
const Oportunidades = lazy(() => import('@/pages/Oportunidades'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
const CasosExito = lazy(() => import('@/pages/CasosExito'));
const DeLooperACapittal = lazy(() => import('@/pages/DeLooperACapittal'));
const Equipo = lazy(() => import('@/pages/Equipo'));

// === CALCULATORS ===
const CalculadoraStandalone = lazy(() => import('@/pages/CalculadoraStandalone'));
const LandingCalculator = lazy(() => import('@/pages/LandingCalculator'));
const LandingCalculadoraFiscal = lazy(() => import('@/pages/LandingCalculadoraFiscal'));
const LandingVentaEmpresas = lazy(() => import('@/pages/LandingVentaEmpresas'));
const LandingSuiteLoop = lazy(() => import('@/pages/LandingSuiteLoop'));
import SecurityCalculator from '@/pages/SecurityCalculator';

// === SERVICE PAGES ===
import Valoraciones from '@/pages/servicios/Valoraciones';
const VentaEmpresasServicio = lazy(() => import('@/pages/servicios/VentaEmpresas'));
const DueDiligence = lazy(() => import('@/pages/servicios/DueDiligence').catch(() => import('@/pages/VentaEmpresas')));
const AsesoramientoLegal = lazy(() => import('@/pages/servicios/AsesoramientoLegal').catch(() => import('@/pages/VentaEmpresas')));
const AsesoramientoLegalTecnico = lazy(() => import('@/pages/servicios/AsesoramientoLegalTecnico').catch(() => import('@/pages/VentaEmpresas')));
const Reestructuraciones = lazy(() => import('@/pages/servicios/Reestructuraciones').catch(() => import('@/pages/VentaEmpresas')));
const PlanificacionFiscal = lazy(() => import('@/pages/servicios/PlanificacionFiscal').catch(() => import('@/pages/VentaEmpresas')));

// === SECTOR PAGES ===
const Tecnologia = lazy(() => import('@/pages/sectores/Tecnologia').catch(() => import('@/pages/VentaEmpresas')));
const Healthcare = lazy(() => import('@/pages/sectores/Healthcare').catch(() => import('@/pages/VentaEmpresas')));
const FinancialServices = lazy(() => import('@/pages/sectores/FinancialServices').catch(() => import('@/pages/VentaEmpresas')));
const Industrial = lazy(() => import('@/pages/sectores/Industrial').catch(() => import('@/pages/VentaEmpresas')));
const RetailConsumer = lazy(() => import('@/pages/sectores/RetailConsumer').catch(() => import('@/pages/VentaEmpresas')));
const Energia = lazy(() => import('@/pages/sectores/Energia').catch(() => import('@/pages/VentaEmpresas')));
const Inmobiliario = lazy(() => import('@/pages/sectores/Inmobiliario').catch(() => import('@/pages/VentaEmpresas')));

// === RESOURCE PAGES ===
const Blog = lazy(() => import('@/pages/recursos/Blog').catch(() => import('@/pages/VentaEmpresas')));
const CaseStudies = lazy(() => import('@/pages/recursos/CaseStudies').catch(() => import('@/pages/VentaEmpresas')));
const MarketReports = lazy(() => import('@/pages/recursos/MarketReports').catch(() => import('@/pages/VentaEmpresas')));
const Newsletter = lazy(() => import('@/pages/recursos/Newsletter').catch(() => import('@/pages/VentaEmpresas')));
const Webinars = lazy(() => import('@/pages/recursos/Webinars').catch(() => import('@/pages/VentaEmpresas')));
const LandingPageView = lazy(() => import('@/pages/LandingPageView').catch(() => import('@/pages/NotFound')));

// === LEGAL PAGES ===
const PorQueElegirnos = lazy(() => import('@/pages/por-que-elegirnos/index').catch(() => import('@/pages/VentaEmpresas')));
const Experiencia = lazy(() => import('@/pages/por-que-elegirnos/experiencia').catch(() => import('@/pages/VentaEmpresas')));
const Metodologia = lazy(() => import('@/pages/por-que-elegirnos/metodologia').catch(() => import('@/pages/VentaEmpresas')));
const Resultados = lazy(() => import('@/pages/por-que-elegirnos/resultados').catch(() => import('@/pages/VentaEmpresas')));
const PoliticaPrivacidad = lazy(() => import('@/pages/PoliticaPrivacidad').catch(() => import('@/pages/VentaEmpresas')));
const TerminosUso = lazy(() => import('@/pages/TerminosUso').catch(() => import('@/pages/VentaEmpresas')));
const Cookies = lazy(() => import('@/pages/Cookies').catch(() => import('@/pages/VentaEmpresas')));
const BlogPost = lazy(() => import('@/pages/blog/BlogPost').catch(() => import('@/pages/VentaEmpresas')));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <Routes>
        {/* === CORE ROUTES === */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<Admin />} />
        
        {/* === BUSINESS ROUTES === */}
        <Route path="/venta-empresas" element={<VentaEmpresas />} />
        <Route path="/compra-empresas" element={<CompraEmpresas />} />
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/marketplace" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
        <Route path="/casos-exito" element={<CasosExito />} />
        <Route path="/nosotros" element={<Navigate to="/por-que-elegirnos" replace />} />
        <Route path="/de-looper-a-capittal" element={<DeLooperACapittal />} />
        <Route path="/equipo" element={<Equipo />} />
        
        {/* === CALCULATOR ROUTES === */}
        <Route path="/calculadora-valoracion" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-valoracion-v2" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-venta/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-ultra-rapido/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-standalone" element={<CalculadoraStandalone />} />
        
        {/* === LANDING CALCULATOR ROUTES === */}
        <Route path="/lp" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/*" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/calculadora" element={<LandingCalculator />} />
        <Route path="/lp/calculadora/*" element={<LandingCalculator />} />
        <Route path="/lp/calculadora-fiscal" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/calculadora-fiscal/*" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/venta-empresas" element={<LandingVentaEmpresas />} />
        <Route path="/lp/suiteloop" element={<LandingSuiteLoop />} />
        <Route path="/seguridad/calculadora" element={<SecurityCalculator />} />
        <Route path="/seguridad/calculadora/*" element={<SecurityCalculator />} />
        
        {/* === SERVICE ROUTES === */}
        <Route path="/servicios/valoraciones" element={<Valoraciones />} />
        <Route path="/servicios/venta-empresas" element={<VentaEmpresasServicio />} />
        <Route path="/servicios/due-diligence" element={<DueDiligence />} />
        <Route path="/servicios/asesoramiento-legal" element={<AsesoramientoLegal />} />
        <Route path="/servicios/asesoramiento-legal/tecnico" element={<AsesoramientoLegalTecnico />} />
        <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
        <Route path="/servicios/planificacion-fiscal" element={<PlanificacionFiscal />} />
        
        {/* === SECTOR ROUTES === */}
        <Route path="/sectores/tecnologia" element={<Tecnologia />} />
        <Route path="/sectores/healthcare" element={<Healthcare />} />
        <Route path="/sectores/financial-services" element={<FinancialServices />} />
        <Route path="/sectores/industrial" element={<Industrial />} />
        <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
        <Route path="/sectores/energia" element={<Energia />} />
        <Route path="/sectores/inmobiliario" element={<Inmobiliario />} />
        
        {/* === RESOURCE ROUTES === */}
        <Route path="/blog" element={<Navigate to="/recursos/blog" replace />} />
        <Route path="/recursos/blog" element={<Blog />} />
        <Route path="/recursos/case-studies" element={<CaseStudies />} />
        <Route path="/recursos/market-reports" element={<MarketReports />} />
        <Route path="/recursos/newsletter" element={<Newsletter />} />
        <Route path="/recursos/webinars" element={<Webinars />} />
        
        {/* === LANDING PAGES === */}
        <Route path="/landing/:slug" element={<LandingPageView />} />
        
        {/* === LEGAL ROUTES === */}
        <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
        <Route path="/por-que-elegirnos/experiencia" element={<Experiencia />} />
        <Route path="/por-que-elegirnos/metodologia" element={<Metodologia />} />
        <Route path="/por-que-elegirnos/resultados" element={<Resultados />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/terminos-uso" element={<TerminosUso />} />
        <Route path="/cookies" element={<Cookies />} />
        
        {/* === BLOG ROUTES === */}
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* === 404 ROUTE === */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};