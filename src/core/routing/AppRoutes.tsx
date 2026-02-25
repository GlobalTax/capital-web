import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

// Redirect component for /lp/calculadora-web → /lp/calculadora?source=web
const CalculadoraWebRedirect = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // Only add source=web if it doesn't already exist
  if (!searchParams.has('source')) {
    searchParams.set('source', 'web');
  }
  
  const newSearch = searchParams.toString();
  const targetUrl = `/lp/calculadora${newSearch ? `?${newSearch}` : ''}`;
  
  return <Navigate to={targetUrl} replace />;
};

// === CORE PAGES ===
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLoginNew = lazy(() => import('@/pages/AdminLoginNew'));
const AuthPage = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// === TEST PAGES ===
const NuevoDiseno = lazy(() => import('@/pages/test/NuevoDiseno'));

// === ADMIN PROTECTION ===
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';

  // === BUSINESS PAGES ===
  const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
  const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
  const Oportunidades = lazy(() => import('@/pages/Oportunidades'));
  const SavedOperations = lazy(() => import('@/pages/SavedOperations'));
  const Contacto = lazy(() => import('@/pages/Contacto'));
  const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
  const CasosExito = lazy(() => import('@/pages/CasosExito'));
  const PorQueElegirnos = lazy(() => import('@/pages/por-que-elegirnos'));
  const DeLooperACapittal = lazy(() => import('@/pages/DeLooperACapittal'));
  const Equipo = lazy(() => import('@/pages/Equipo'));

// === CALCULATORS ===
const CalculadoraStandalone = lazy(() => import('@/pages/CalculadoraStandalone'));
const LandingCalculator = lazy(() => import('@/pages/LandingCalculator'));
const LandingCalculadoraFiscal = lazy(() => import('@/pages/LandingCalculadoraFiscal'));
const LandingCalculadoraAsesores = lazy(() => import('@/pages/LandingCalculadoraAsesores'));
const LandingCalculatorMeta = lazy(() => import('@/pages/LandingCalculatorMeta'));
const LandingCalculatorMetaThanks = lazy(() => import('@/pages/LandingCalculatorMetaThanks'));
const LandingCalculatorB = lazy(() => import('@/pages/LandingCalculatorB')); // 🔥 NUEVO - Variante B Typeform
const LandingVentaEmpresas = lazy(() => import('@/pages/LandingVentaEmpresas'));
const LandingVentaEmpresasV2 = lazy(() => import('@/pages/LandingVentaEmpresasV2'));
const LandingSuiteLoop = lazy(() => import('@/pages/LandingSuiteLoop'));
const LandingAccountex = lazy(() => import('@/pages/LandingAccountex'));
const LandingValoracion2026 = lazy(() => import('@/pages/LandingValoracion2026'));
const LandingValoracion2026Thanks = lazy(() => import('@/pages/LandingValoracion2026Thanks'));
const HubVentaEmpresa = lazy(() => import('@/pages/HubVentaEmpresa'));
const LandingCompraEmpresasMeta = lazy(() => import('@/pages/LandingCompraEmpresasMeta'));
const LandingOpenDeals = lazy(() => import('@/pages/LandingOpenDeals'));
const LandingOportunidadesMeta = lazy(() => import('@/pages/LandingOportunidadesMeta'));
const LandingRODLinkedIn = lazy(() => import('@/pages/LandingRODLinkedIn'));
import SecurityCalculator from '@/pages/SecurityCalculator';
const LandingSimuladorSeguridad = lazy(() => import('@/pages/LandingSimuladorSeguridad'));

// === SERVICE PAGES ===
import Valoraciones from '@/pages/servicios/Valoraciones';
const VentaEmpresasServicio = lazy(() => import('@/pages/servicios/VentaEmpresas'));
const DueDiligence = lazy(() => import('@/pages/servicios/DueDiligence').catch(() => import('@/pages/VentaEmpresas')));
const AsesoramientoLegal = lazy(() => import('@/pages/servicios/AsesoramientoLegal').catch(() => import('@/pages/VentaEmpresas')));
const AsesoramientoLegalTecnico = lazy(() => import('@/pages/servicios/AsesoramientoLegalTecnico').catch(() => import('@/pages/VentaEmpresas')));
const Reestructuraciones = lazy(() => import('@/pages/servicios/Reestructuraciones').catch(() => import('@/pages/VentaEmpresas')));
const PlanificacionFiscal = lazy(() => import('@/pages/servicios/PlanificacionFiscal').catch(() => import('@/pages/VentaEmpresas')));
const SearchFunds = lazy(() => import('@/pages/servicios/SearchFunds'));
const ValoracionEmpresas = lazy(() => import('@/pages/ValoracionEmpresas'));
const GuiaValoracionEmpresas = lazy(() => import('@/pages/GuiaValoracionEmpresas'));

// === SECTOR PAGES ===
const Tecnologia = lazy(() => import('@/pages/sectores/Tecnologia').catch(() => import('@/pages/VentaEmpresas')));
const Healthcare = lazy(() => import('@/pages/sectores/Healthcare').catch(() => import('@/pages/VentaEmpresas')));
const Industrial = lazy(() => import('@/pages/sectores/Industrial').catch(() => import('@/pages/VentaEmpresas')));
const RetailConsumer = lazy(() => import('@/pages/sectores/RetailConsumer').catch(() => import('@/pages/VentaEmpresas')));
const Energia = lazy(() => import('@/pages/sectores/Energia').catch(() => import('@/pages/VentaEmpresas')));
const Seguridad = lazy(() => import('@/pages/sectores/Seguridad').catch(() => import('@/pages/VentaEmpresas')));
const Construccion = lazy(() => import('@/pages/sectores/Construccion').catch(() => import('@/pages/VentaEmpresas')));
const Alimentacion = lazy(() => import('@/pages/sectores/Alimentacion').catch(() => import('@/pages/VentaEmpresas')));
const Logistica = lazy(() => import('@/pages/sectores/Logistica').catch(() => import('@/pages/VentaEmpresas')));
const MedioAmbiente = lazy(() => import('@/pages/sectores/MedioAmbiente').catch(() => import('@/pages/VentaEmpresas')));

// === RESOURCE PAGES ===
const Blog = lazy(() => import('@/pages/recursos/Blog').catch(() => import('@/pages/VentaEmpresas')));
const Noticias = lazy(() => import('@/pages/recursos/Noticias'));
const TestExitReady = lazy(() => import('@/pages/recursos/TestExitReady').catch(() => import('@/pages/VentaEmpresas')));
const SearchFundsHub = lazy(() => import('@/pages/recursos/SearchFundsHub'));
const InformesMA = lazy(() => import('@/pages/recursos/InformesMA'));

// === SEARCH FUNDS RESOURCE CENTER ===
const SearchFundsResourceCenter = lazy(() => import('@/pages/search-funds/SearchFundsResourceCenter'));
const SearchFundsGuide = lazy(() => import('@/pages/search-funds/SearchFundsGuide'));
const SearchFundsGlossary = lazy(() => import('@/pages/search-funds/SearchFundsGlossary'));
const SearchFundsTools = lazy(() => import('@/pages/search-funds/SearchFundsTools'));
const SearchFundsCases = lazy(() => import('@/pages/search-funds/SearchFundsCases'));
const SearchFundsLibrary = lazy(() => import('@/pages/search-funds/SearchFundsLibrary'));
const SearchFundsCommunity = lazy(() => import('@/pages/search-funds/SearchFundsCommunity'));

// === SEARCH FUNDS ADVANCED GUIDES ===
const SearchFundsSourcing = lazy(() => import('@/pages/search-funds/SearchFundsSourcing'));
const SearchFundsValuation = lazy(() => import('@/pages/search-funds/SearchFundsValuation'));
const SearchFundsNegotiation = lazy(() => import('@/pages/search-funds/SearchFundsNegotiation'));
const SearchFundsPostAcquisition = lazy(() => import('@/pages/search-funds/SearchFundsPostAcquisition'));

// === SEARCHER REGISTRATION ===
const SearcherRegistration = lazy(() => import('@/pages/SearcherRegistration'));
const SearcherRegistrationConfirmation = lazy(() => import('@/pages/SearcherRegistrationConfirmation'));

// === BOOKING PAGE ===
const BookingPage = lazy(() => import('@/components/booking/BookingPage'));
const CaseStudies = lazy(() => import('@/pages/recursos/CaseStudies').catch(() => import('@/pages/VentaEmpresas')));

const Newsletter = lazy(() => import('@/pages/recursos/Newsletter').catch(() => import('@/pages/VentaEmpresas')));
const Webinars = lazy(() => import('@/pages/recursos/Webinars').catch(() => import('@/pages/VentaEmpresas')));
const LandingPageView = lazy(() => import('@/pages/LandingPageView').catch(() => import('@/pages/NotFound')));

// === PRESENTATIONS (Shared) ===
const SharedPresentationPage = lazy(() => import('@/features/presentations/pages/SharedPresentationPage'));

// === JOB POSTS ===
const JobsPage = lazy(() => import('@/pages/JobsPage').catch(() => import('@/pages/VentaEmpresas')));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage').catch(() => import('@/pages/NotFound')));

// === LEGAL & SUB-PAGES ===
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
        <Route path="/ca" element={<Index />} />
        <Route path="/inici" element={<Index />} />
        <Route path="/en" element={<Index />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/login" element={<AdminLoginNew />} />
        <Route path="/admin/login-new" element={<AdminLoginNew />} />
        <Route path="/admin/*" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
        
        {/* === TEST ROUTES === */}
        <Route path="/test/nuevo-diseno" element={<NuevoDiseno />} />
        
        {/* === V2 PREVIEW (Nuevo diseño institucional) === */}
        <Route path="/v2" element={<NuevoDiseno />} />
        
        {/* === SHARED PRESENTATIONS (Public Access with Token) === */}
        <Route path="/p/:token" element={<SharedPresentationPage />} />
        
        {/* === BUSINESS ROUTES === */}
        <Route path="/venta-empresas" element={<VentaEmpresas />} />
        <Route path="/venda-empreses" element={<VentaEmpresas />} />
        <Route path="/sell-companies" element={<VentaEmpresas />} />
        
        <Route path="/compra-empresas" element={<CompraEmpresas />} />
        <Route path="/compra-empreses" element={<Navigate to="/compra-empresas" replace />} />
        <Route path="/buy-companies" element={<CompraEmpresas />} />
        
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/favoritos" element={<SavedOperations />} />
        <Route path="/marketplace" element={<Navigate to="/oportunidades" replace />} />
        
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/contacte" element={<Contacto />} />
        <Route path="/contact" element={<Contacto />} />
        
        <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
        <Route path="/programa-col·laboradors" element={<ProgramaColaboradores />} />
        <Route path="/programa-col-laboradors" element={<ProgramaColaboradores />} />
        <Route path="/collaborators-program" element={<ProgramaColaboradores />} />
        
        <Route path="/casos-exito" element={<CasosExito />} />
        <Route path="/casos-exit" element={<CasosExito />} />
        <Route path="/success-stories" element={<CasosExito />} />
        
        <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
        <Route path="/per-que-triar-nos" element={<PorQueElegirnos />} />
        <Route path="/why-choose-us" element={<PorQueElegirnos />} />
        
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/equip" element={<Equipo />} />
        <Route path="/team" element={<Navigate to="/equipo" replace />} />
        
        <Route path="/nosotros" element={<Navigate to="/por-que-elegirnos" replace />} />
        <Route path="/de-looper-a-capittal" element={<DeLooperACapittal />} />
        
        {/* === CALCULATOR ROUTES === */}
        <Route path="/calculadora-valoracion" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-valoracion-v2" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-venta/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/simulador-ultra-rapido/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/calculadora-standalone" element={<CalculadoraStandalone />} />
        
        {/* === LANDING CALCULATOR ROUTES === */}
        <Route path="/lp" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/calculadora-web" element={<CalculadoraWebRedirect />} />
        <Route path="/lp/calculadora-web/*" element={<CalculadoraWebRedirect />} />
        <Route path="/lp/calculadora" element={<LandingCalculator />} />
        <Route path="/lp/calculadora/*" element={<LandingCalculator />} />
        <Route path="/lp/calculadora-b" element={<LandingCalculatorB />} />
        <Route path="/lp/calculadora-b/*" element={<LandingCalculatorB />} />
        <Route path="/lp/calculadora-fiscal" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/calculadora-fiscal/*" element={<LandingCalculadoraFiscal />} />
        <Route path="/lp/calculadora-asesores" element={<LandingCalculadoraAsesores />} />
        <Route path="/lp/calculadora-asesores/*" element={<LandingCalculadoraAsesores />} />
        <Route path="/lp/calculadora-meta" element={<LandingCalculatorMeta />} />
        <Route path="/lp/calculadora-meta/*" element={<LandingCalculatorMeta />} />
        <Route path="/lp/calculadora-meta/gracias" element={<LandingCalculatorMetaThanks />} />
        <Route path="/lp/venta-empresas" element={<LandingVentaEmpresas />} />
        <Route path="/lp/venta-empresas-v2" element={<LandingVentaEmpresasV2 />} />
        <Route path="/lp/suiteloop" element={<LandingSuiteLoop />} />
        <Route path="/lp/accountex" element={<LandingAccountex />} />
        <Route path="/lp/accountex/*" element={<LandingAccountex />} />
        <Route path="/lp/valoracion-2026" element={<LandingValoracion2026 />} />
        <Route path="/lp/valoracion-2026/gracias" element={<LandingValoracion2026Thanks />} />
        <Route path="/lp/valoracion-2026/*" element={<LandingValoracion2026 />} />
        <Route path="/lp/compra-empresas-meta" element={<LandingCompraEmpresasMeta />} />
        <Route path="/lp/open-deals" element={<LandingOpenDeals />} />
        <Route path="/lp/oportunidades-meta" element={<LandingOportunidadesMeta />} />
        <Route path="/lp/rod-linkedin" element={<LandingRODLinkedIn />} />
        <Route path="/accountex" element={<Navigate to="/lp/accountex" replace />} />
        <Route path="/accountex-2025" element={<Navigate to="/lp/accountex" replace />} />
        <Route path="/seguridad/calculadora" element={<SecurityCalculator />} />
        <Route path="/seguridad/calculadora/*" element={<SecurityCalculator />} />
        <Route path="/lp/simulador-seguridad" element={<LandingSimuladorSeguridad />} />
        <Route path="/lp/simulador-seguridad/*" element={<LandingSimuladorSeguridad />} />
        
        {/* === BOOKING ROUTES === */}
        <Route path="/book/:token" element={<BookingPage />} />
        
        {/* === SERVICE ROUTES (Spanish) === */}
        <Route path="/servicios/valoraciones" element={<Valoraciones />} />
        <Route path="/servicios/venta-empresas" element={<VentaEmpresasServicio />} />
        <Route path="/servicios/due-diligence" element={<DueDiligence />} />
        <Route path="/servicios/asesoramiento-legal" element={<AsesoramientoLegal />} />
        <Route path="/servicios/asesoramiento-legal/tecnico" element={<AsesoramientoLegalTecnico />} />
        <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
        <Route path="/servicios/planificacion-fiscal" element={<PlanificacionFiscal />} />
        <Route path="/servicios/search-funds" element={<SearchFunds />} />
        <Route path="/search-funds" element={<SearchFunds />} />
        <Route path="/valoracion-empresas" element={<ValoracionEmpresas />} />
        <Route path="/guia-valoracion-empresas" element={<GuiaValoracionEmpresas />} />
        
        {/* === SERVICE ROUTES (Catalan) === */}
        <Route path="/serveis/valoracions" element={<Valoraciones />} />
        <Route path="/serveis/venda-empreses" element={<VentaEmpresasServicio />} />
        <Route path="/serveis/due-diligence" element={<DueDiligence />} />
        <Route path="/serveis/assessorament-legal" element={<AsesoramientoLegal />} />
        <Route path="/serveis/reestructuracions" element={<Reestructuraciones />} />
        <Route path="/serveis/planificacio-fiscal" element={<PlanificacionFiscal />} />
        
        {/* === SERVICE ROUTES (English) === */}
        <Route path="/services/valuations" element={<Valoraciones />} />
        <Route path="/services/sell-companies" element={<VentaEmpresasServicio />} />
        <Route path="/services/due-diligence" element={<DueDiligence />} />
        <Route path="/services/legal-advisory" element={<AsesoramientoLegal />} />
        <Route path="/services/restructuring" element={<Reestructuraciones />} />
        <Route path="/services/tax-planning" element={<PlanificacionFiscal />} />
        
        {/* === SECTOR ROUTES (Spanish) === */}
        <Route path="/sectores/tecnologia" element={<Tecnologia />} />
        <Route path="/sectores/healthcare" element={<Healthcare />} />
        <Route path="/sectores/industrial" element={<Industrial />} />
        <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
        <Route path="/sectores/energia" element={<Energia />} />
        <Route path="/sectores/seguridad" element={<Seguridad />} />
        <Route path="/sectores/construccion" element={<Construccion />} />
        <Route path="/sectores/alimentacion" element={<Alimentacion />} />
        <Route path="/sectores/logistica" element={<Logistica />} />
        <Route path="/sectores/medio-ambiente" element={<MedioAmbiente />} />
        
        {/* === SECTOR ROUTES (Catalan) === */}
        <Route path="/sectors/tecnologia" element={<Tecnologia />} />
        <Route path="/sectors/salut" element={<Healthcare />} />
        <Route path="/sectors/industrial" element={<Industrial />} />
        <Route path="/sectors/retail-consum" element={<RetailConsumer />} />
        <Route path="/sectors/energia" element={<Energia />} />
        <Route path="/sectors/seguretat" element={<Seguridad />} />
        <Route path="/sectors/construccio" element={<Construccion />} />
        <Route path="/sectors/alimentacio" element={<Alimentacion />} />
        <Route path="/sectors/logistica" element={<Logistica />} />
        <Route path="/sectors/medi-ambient" element={<MedioAmbiente />} />
        
        {/* === SECTOR ROUTES (English) === */}
        <Route path="/sectors/technology" element={<Tecnologia />} />
        <Route path="/sectors/healthcare" element={<Healthcare />} />
        <Route path="/sectors/retail-consumer" element={<RetailConsumer />} />
        <Route path="/sectors/energy" element={<Energia />} />
        <Route path="/sectors/security" element={<Seguridad />} />
        
        {/* === PHANTOM SECTOR REDIRECTS === */}
        <Route path="/sectores/financial-services" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectores/inmobiliario" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/serveis-financers" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/immobiliari" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/real-estate" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/financial-services" element={<Navigate to="/oportunidades" replace />} />
        
        {/* === OPERATION DETAIL REDIRECT === */}
        <Route path="/operaciones/:id" element={<Navigate to="/oportunidades" replace />} />
        
        {/* === PARTNERS PROGRAM (English) === */}
        <Route path="/partners-program" element={<ProgramaColaboradores />} />
        
        {/* === JOB POSTS ROUTES === */}
        <Route path="/oportunidades/empleo" element={<JobsPage />} />
        <Route path="/oportunidades/empleo/:slug" element={<JobDetailPage />} />
        
        {/* === RESOURCE ROUTES === */}
        <Route path="/blog" element={<Navigate to="/recursos/blog" replace />} />
        <Route path="/recursos/blog" element={<Blog />} />
        <Route path="/recursos/noticias" element={<Noticias />} />
        <Route path="/recursos/test-exit-ready" element={<TestExitReady />} />
        <Route path="/recursos/case-studies" element={<CaseStudies />} />
        <Route path="/recursos/newsletter" element={<Newsletter />} />
        <Route path="/recursos/webinars" element={<Webinars />} />
        <Route path="/recursos/informes-ma" element={<InformesMA />} />
        
        {/* === SEARCH FUNDS RESOURCE CENTER === */}
        <Route path="/search-funds/recursos" element={<SearchFundsResourceCenter />} />
        <Route path="/search-funds/recursos/guia" element={<SearchFundsGuide />} />
        <Route path="/search-funds/recursos/glosario" element={<SearchFundsGlossary />} />
        <Route path="/search-funds/recursos/herramientas" element={<SearchFundsTools />} />
        <Route path="/search-funds/recursos/casos" element={<SearchFundsCases />} />
        <Route path="/search-funds/recursos/biblioteca" element={<SearchFundsLibrary />} />
        <Route path="/search-funds/recursos/comunidad" element={<SearchFundsCommunity />} />
        
        {/* === SEARCH FUNDS ADVANCED GUIDES === */}
        <Route path="/search-funds/recursos/sourcing" element={<SearchFundsSourcing />} />
        <Route path="/search-funds/recursos/valoracion" element={<SearchFundsValuation />} />
        <Route path="/search-funds/recursos/negociacion" element={<SearchFundsNegotiation />} />
        <Route path="/search-funds/recursos/post-adquisicion" element={<SearchFundsPostAcquisition />} />
        
        {/* === SEARCHER REGISTRATION === */}
        <Route path="/search-funds/registro-searcher" element={<SearcherRegistration />} />
        <Route path="/search-funds/registro-confirmado" element={<SearcherRegistrationConfirmation />} />
        
        <Route path="/recursos/search-funds" element={<Navigate to="/search-funds/recursos" replace />} />
        <Route path="/guia-search-funds" element={<Navigate to="/search-funds/recursos/guia" replace />} />
        
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