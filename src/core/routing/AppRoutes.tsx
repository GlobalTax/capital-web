import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { PageLoadingSkeleton } from '@/components/LoadingStates';

// Trailing slash normalizer - strips trailing slashes to avoid duplicate URLs
const TrailingSlashRedirect = () => {
  const location = useLocation();
  if (location.pathname !== '/' && location.pathname.endsWith('/')) {
    const trimmed = location.pathname.replace(/\/+$/, '');
    return <Navigate to={`${trimmed}${location.search}${location.hash}`} replace />;
  }
  return null;
};

// === DIRECT IMPORTS — Public marketing pages (no lazy loading for SEO) ===
import Index from '@/pages/Index';
import VentaEmpresas from '@/pages/VentaEmpresas';
import CompraEmpresas from '@/pages/CompraEmpresas';
import Contacto from '@/pages/Contacto';
import ProgramaColaboradores from '@/pages/ProgramaColaboradores';
import CasosExito from '@/pages/CasosExito';
import PorQueElegirnos from '@/pages/por-que-elegirnos';
import DeLooperACapittal from '@/pages/DeLooperACapittal';
import Equipo from '@/pages/Equipo';

// === SERVICE PAGES (Direct imports) ===
import Valoraciones from '@/pages/servicios/Valoraciones';
import VentaEmpresasServicio from '@/pages/servicios/VentaEmpresas';
import DueDiligence from '@/pages/servicios/DueDiligence';
import AsesoramientoLegal from '@/pages/servicios/AsesoramientoLegal';
import AsesoramientoLegalTecnico from '@/pages/servicios/AsesoramientoLegalTecnico';
import Reestructuraciones from '@/pages/servicios/Reestructuraciones';
import PlanificacionFiscal from '@/pages/servicios/PlanificacionFiscal';
import SearchFunds from '@/pages/servicios/SearchFunds';
import ValoracionEmpresas from '@/pages/ValoracionEmpresas';
import GuiaValoracionEmpresas from '@/pages/GuiaValoracionEmpresas';

// === SECTOR PAGES (Direct imports) ===
import Tecnologia from '@/pages/sectores/Tecnologia';
import Healthcare from '@/pages/sectores/Healthcare';
import Industrial from '@/pages/sectores/Industrial';
import RetailConsumer from '@/pages/sectores/RetailConsumer';
import Energia from '@/pages/sectores/Energia';
import Seguridad from '@/pages/sectores/Seguridad';
import Construccion from '@/pages/sectores/Construccion';
import Alimentacion from '@/pages/sectores/Alimentacion';
import Logistica from '@/pages/sectores/Logistica';
import MedioAmbiente from '@/pages/sectores/MedioAmbiente';

// === RESOURCE PAGES (Direct imports) ===
import Blog from '@/pages/recursos/Blog';
import TestExitReady from '@/pages/recursos/TestExitReady';
import GuiaVenderEmpresa from '@/pages/recursos/GuiaVenderEmpresa';
import BlogPost from '@/pages/blog/BlogPost';
import LandingCalculator from '@/pages/LandingCalculator';

// === SECURITY CALCULATOR (Direct import) ===
import SecurityCalculator from '@/pages/SecurityCalculator';

// === LAZY IMPORTS — Authenticated / non-SEO pages ===
const Admin = lazy(() => import('@/pages/Admin'));
const AdminLoginNew = lazy(() => import('@/pages/AdminLoginNew'));
const AuthPage = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const NuevoDiseno = lazy(() => import('@/pages/test/NuevoDiseno'));
const Oportunidades = lazy(() => import('@/pages/Oportunidades'));
const SavedOperations = lazy(() => import('@/pages/SavedOperations'));
const CalculadoraStandalone = lazy(() => import('@/pages/CalculadoraStandalone'));
const LandingCalculadoraFiscal = lazy(() => import('@/pages/LandingCalculadoraFiscal'));
const LandingCalculadoraAsesores = lazy(() => import('@/pages/LandingCalculadoraAsesores'));
const LandingCalculatorMeta = lazy(() => import('@/pages/LandingCalculatorMeta'));
const LandingCalculatorMetaThanks = lazy(() => import('@/pages/LandingCalculatorMetaThanks'));
const LandingCalculatorB = lazy(() => import('@/pages/LandingCalculatorB'));
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
const LandingSimuladorSeguridad = lazy(() => import('@/pages/LandingSimuladorSeguridad'));
const Noticias = lazy(() => import('@/pages/recursos/Noticias'));
const NewsArticleDetail = lazy(() => import('@/pages/recursos/NewsArticleDetail'));
const SearchFundsHub = lazy(() => import('@/pages/recursos/SearchFundsHub'));
const InformesMA = lazy(() => import('@/pages/recursos/InformesMA'));
const SearchFundsResourceCenter = lazy(() => import('@/pages/search-funds/SearchFundsResourceCenter'));
const SearchFundsGuide = lazy(() => import('@/pages/search-funds/SearchFundsGuide'));
const SearchFundsGlossary = lazy(() => import('@/pages/search-funds/SearchFundsGlossary'));
const SearchFundsTools = lazy(() => import('@/pages/search-funds/SearchFundsTools'));
const SearchFundsCases = lazy(() => import('@/pages/search-funds/SearchFundsCases'));
const SearchFundsLibrary = lazy(() => import('@/pages/search-funds/SearchFundsLibrary'));
const SearchFundsCommunity = lazy(() => import('@/pages/search-funds/SearchFundsCommunity'));
const SearchFundsSourcing = lazy(() => import('@/pages/search-funds/SearchFundsSourcing'));
const SearchFundsValuation = lazy(() => import('@/pages/search-funds/SearchFundsValuation'));
const SearchFundsNegotiation = lazy(() => import('@/pages/search-funds/SearchFundsNegotiation'));
const SearchFundsPostAcquisition = lazy(() => import('@/pages/search-funds/SearchFundsPostAcquisition'));
const SearcherRegistration = lazy(() => import('@/pages/SearcherRegistration'));
const SearcherRegistrationConfirmation = lazy(() => import('@/pages/SearcherRegistrationConfirmation'));
const BookingPage = lazy(() => import('@/components/booking/BookingPage'));
const CaseStudies = lazy(() => import('@/pages/recursos/CaseStudies').catch(() => import('@/pages/VentaEmpresas')));
const Newsletter = lazy(() => import('@/pages/recursos/Newsletter').catch(() => import('@/pages/VentaEmpresas')));
const Webinars = lazy(() => import('@/pages/recursos/Webinars').catch(() => import('@/pages/VentaEmpresas')));
const LandingPageView = lazy(() => import('@/pages/LandingPageView').catch(() => import('@/pages/NotFound')));
const SharedPresentationPage = lazy(() => import('@/features/presentations/pages/SharedPresentationPage'));
const JobsPage = lazy(() => import('@/pages/JobsPage').catch(() => import('@/pages/VentaEmpresas')));
const JobDetailPage = lazy(() => import('@/pages/JobDetailPage').catch(() => import('@/pages/NotFound')));
const Experiencia = lazy(() => import('@/pages/por-que-elegirnos/experiencia').catch(() => import('@/pages/VentaEmpresas')));
const Metodologia = lazy(() => import('@/pages/por-que-elegirnos/metodologia').catch(() => import('@/pages/VentaEmpresas')));
const Resultados = lazy(() => import('@/pages/por-que-elegirnos/resultados').catch(() => import('@/pages/VentaEmpresas')));
const PoliticaPrivacidad = lazy(() => import('@/pages/PoliticaPrivacidad').catch(() => import('@/pages/VentaEmpresas')));
const TerminosUso = lazy(() => import('@/pages/TerminosUso').catch(() => import('@/pages/VentaEmpresas')));
const Cookies = lazy(() => import('@/pages/Cookies').catch(() => import('@/pages/VentaEmpresas')));

// === ADMIN PROTECTION ===
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';

// Helper: redirect from old blog path to new hierarchy
const BlogSlugRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/recursos/blog/${slug}`} replace />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      {/* Normalize trailing slashes globally */}
      <TrailingSlashRedirect />
      <Routes>
        {/* === CORE ROUTES === */}
        <Route path="/" element={<Index />} />
        <Route path="/ca" element={<Navigate to="/" replace />} />
        <Route path="/inici" element={<Navigate to="/" replace />} />
        <Route path="/en" element={<Navigate to="/" replace />} />
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
        
        {/* === BUSINESS ROUTES (Canonical: Spanish) === */}
        <Route path="/venta-empresas" element={<VentaEmpresas />} />
        <Route path="/venda-empreses" element={<Navigate to="/venta-empresas" replace />} />
        <Route path="/sell-companies" element={<Navigate to="/venta-empresas" replace />} />
        
        <Route path="/compra-empresas" element={<CompraEmpresas />} />
        <Route path="/compra-empreses" element={<Navigate to="/compra-empresas" replace />} />
        <Route path="/buy-companies" element={<Navigate to="/compra-empresas" replace />} />
        
        <Route path="/oportunidades" element={<Oportunidades />} />
        <Route path="/favoritos" element={<SavedOperations />} />
        <Route path="/marketplace" element={<Navigate to="/oportunidades" replace />} />
        
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/contacte" element={<Navigate to="/contacto" replace />} />
        <Route path="/contact" element={<Navigate to="/contacto" replace />} />
        
        <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
        <Route path="/programa-col·laboradors" element={<Navigate to="/programa-colaboradores" replace />} />
        <Route path="/programa-col-laboradors" element={<Navigate to="/programa-colaboradores" replace />} />
        <Route path="/collaborators-program" element={<Navigate to="/programa-colaboradores" replace />} />
        <Route path="/partners-program" element={<Navigate to="/programa-colaboradores" replace />} />
        
        <Route path="/casos-exito" element={<CasosExito />} />
        <Route path="/casos-exit" element={<Navigate to="/casos-exito" replace />} />
        <Route path="/success-stories" element={<Navigate to="/casos-exito" replace />} />
        
        <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
        <Route path="/per-que-triar-nos" element={<Navigate to="/por-que-elegirnos" replace />} />
        <Route path="/why-choose-us" element={<Navigate to="/por-que-elegirnos" replace />} />
        
        <Route path="/equipo" element={<Equipo />} />
        <Route path="/equip" element={<Navigate to="/equipo" replace />} />
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
        <Route path="/lp/calculadora-web" element={<Navigate to="/lp/calculadora" replace />} />
        <Route path="/lp/calculadora-web/*" element={<Navigate to="/lp/calculadora" replace />} />
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
        
        {/* === SERVICE ROUTES (Canonical: Spanish) === */}
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
        
        {/* === SERVICE ROUTES (Catalan → redirect to Spanish) === */}
        <Route path="/serveis/valoracions" element={<Navigate to="/servicios/valoraciones" replace />} />
        <Route path="/serveis/venda-empreses" element={<Navigate to="/servicios/venta-empresas" replace />} />
        <Route path="/serveis/due-diligence" element={<Navigate to="/servicios/due-diligence" replace />} />
        <Route path="/serveis/assessorament-legal" element={<Navigate to="/servicios/asesoramiento-legal" replace />} />
        <Route path="/serveis/reestructuracions" element={<Navigate to="/servicios/reestructuraciones" replace />} />
        <Route path="/serveis/planificacio-fiscal" element={<Navigate to="/servicios/planificacion-fiscal" replace />} />
        
        {/* === SERVICE ROUTES (English → redirect to Spanish) === */}
        <Route path="/services/valuations" element={<Navigate to="/servicios/valoraciones" replace />} />
        <Route path="/services/sell-companies" element={<Navigate to="/servicios/venta-empresas" replace />} />
        <Route path="/services/due-diligence" element={<Navigate to="/servicios/due-diligence" replace />} />
        <Route path="/services/legal-advisory" element={<Navigate to="/servicios/asesoramiento-legal" replace />} />
        <Route path="/services/restructuring" element={<Navigate to="/servicios/reestructuraciones" replace />} />
        <Route path="/services/tax-planning" element={<Navigate to="/servicios/planificacion-fiscal" replace />} />
        
        {/* === SECTOR ROUTES (Canonical: Spanish) === */}
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
        
        {/* === SECTOR ROUTES (Catalan → redirect to Spanish) === */}
        <Route path="/sectors/tecnologia" element={<Navigate to="/sectores/tecnologia" replace />} />
        <Route path="/sectors/salut" element={<Navigate to="/sectores/healthcare" replace />} />
        <Route path="/sectors/industrial" element={<Navigate to="/sectores/industrial" replace />} />
        <Route path="/sectors/retail-consum" element={<Navigate to="/sectores/retail-consumer" replace />} />
        <Route path="/sectors/energia" element={<Navigate to="/sectores/energia" replace />} />
        <Route path="/sectors/seguretat" element={<Navigate to="/sectores/seguridad" replace />} />
        <Route path="/sectors/construccio" element={<Navigate to="/sectores/construccion" replace />} />
        <Route path="/sectors/alimentacio" element={<Navigate to="/sectores/alimentacion" replace />} />
        <Route path="/sectors/logistica" element={<Navigate to="/sectores/logistica" replace />} />
        <Route path="/sectors/medi-ambient" element={<Navigate to="/sectores/medio-ambiente" replace />} />
        
        {/* === SECTOR ROUTES (English → redirect to Spanish) === */}
        <Route path="/sectors/technology" element={<Navigate to="/sectores/tecnologia" replace />} />
        <Route path="/sectors/healthcare" element={<Navigate to="/sectores/healthcare" replace />} />
        <Route path="/sectors/retail-consumer" element={<Navigate to="/sectores/retail-consumer" replace />} />
        <Route path="/sectors/energy" element={<Navigate to="/sectores/energia" replace />} />
        <Route path="/sectors/security" element={<Navigate to="/sectores/seguridad" replace />} />
        
        {/* === PHANTOM SECTOR REDIRECTS === */}
        <Route path="/sectores/financial-services" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectores/inmobiliario" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/serveis-financers" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/immobiliari" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/real-estate" element={<Navigate to="/oportunidades" replace />} />
        <Route path="/sectors/financial-services" element={<Navigate to="/oportunidades" replace />} />
        
        {/* === OPERATION DETAIL REDIRECT === */}
        <Route path="/operaciones/:id" element={<Navigate to="/oportunidades" replace />} />
        
        {/* === JOB POSTS ROUTES === */}
        <Route path="/oportunidades/empleo" element={<JobsPage />} />
        <Route path="/oportunidades/empleo/:slug" element={<JobDetailPage />} />
        
        {/* === RESOURCE ROUTES === */}
        <Route path="/blog" element={<Navigate to="/recursos/blog" replace />} />
        <Route path="/blog/:slug" element={<BlogSlugRedirect />} />
        <Route path="/recursos/blog" element={<Blog />} />
        <Route path="/recursos/blog/:slug" element={<BlogPost />} />
        <Route path="/recursos/noticias" element={<Noticias />} />
        <Route path="/recursos/noticias/:slug" element={<NewsArticleDetail />} />
        <Route path="/recursos/test-exit-ready" element={<TestExitReady />} />
        <Route path="/recursos/guia-vender-empresa" element={<GuiaVenderEmpresa />} />
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
        <Route path="/por-que-elegirnos/experiencia" element={<Experiencia />} />
        <Route path="/por-que-elegirnos/metodologia" element={<Metodologia />} />
        <Route path="/por-que-elegirnos/resultados" element={<Resultados />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/terminos-uso" element={<TerminosUso />} />
        <Route path="/cookies" element={<Cookies />} />
        
        {/* === 404 ROUTE === */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
