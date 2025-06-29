import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminAccess from '@/components/admin/AdminAccess';
import Index from '@/pages/Index';
import Nosotros from '@/pages/Nosotros';
import Equipo from '@/pages/Equipo';
import Contacto from '@/pages/Contacto';
import CalculadoraValoracion from '@/pages/CalculadoraValoracion';
import CalculadoraValoracionV2 from "@/pages/CalculadoraValoracionV2";
import VentaEmpresas from '@/pages/VentaEmpresas';
import CompraEmpresas from '@/pages/CompraEmpresas';
import CasosExito from '@/pages/CasosExito';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import PoliticaPrivacidad from '@/pages/PoliticaPrivacidad';
import TerminosUso from '@/pages/TerminosUso';
import Cookies from '@/pages/Cookies';
import DocumentacionMA from '@/pages/DocumentacionMA';
import ProgramaColaboradores from '@/pages/ProgramaColaboradores';
import BlogPost from '@/pages/blog/BlogPost';

// Por Qué Elegirnos
import PorQueElegirnos from '@/pages/por-que-elegirnos/index';

// Servicios
import Valoraciones from '@/pages/servicios/Valoraciones';
import AsesoramientoLegal from '@/pages/servicios/AsesoramientoLegal';
import PlanificacionFiscal from '@/pages/servicios/PlanificacionFiscal';
import DueDiligence from '@/pages/servicios/DueDiligence';
import Reestructuraciones from '@/pages/servicios/Reestructuraciones';

// Sectores - Updated and new pages
import Healthcare from '@/pages/sectores/Healthcare';
import Industrial from '@/pages/sectores/Industrial';
import Tecnologia from '@/pages/sectores/Tecnologia';
import FinancialServices from '@/pages/sectores/FinancialServices';
import RetailConsumer from '@/pages/sectores/RetailConsumer';
import Energia from '@/pages/sectores/Energia';
import Inmobiliario from '@/pages/sectores/Inmobiliario';

// Recursos
import Blog from '@/pages/recursos/Blog';

// Documentación M&A pages
import NuestroMetodo from '@/pages/documentacion-ma/NuestroMetodo';
import ConoceEquipo from '@/pages/documentacion-ma/ConoceEquipo';
import Resultados from '@/pages/documentacion-ma/Resultados';
import Fase1 from '@/pages/documentacion-ma/Fase1';
import Fase2Lucha from '@/pages/documentacion-ma/Fase2Lucha';
import DynamicComponents from '@/pages/documentacion-ma/DynamicComponents';
import Customization from '@/pages/documentacion-ma/Customization';
import Typography from '@/pages/documentacion-ma/Typography';
import Spacing from '@/pages/documentacion-ma/Spacing';
import Variables from '@/pages/documentacion-ma/Variables';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundaryProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/equipo" element={<Equipo />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/calculadora-valoracion" element={<CalculadoraValoracion />} />
                <Route path="/calculadora-valoracion-v2" element={<CalculadoraValoracionV2 />} />
                <Route path="/venta-empresas" element={<VentaEmpresas />} />
                <Route path="/compra-empresas" element={<CompraEmpresas />} />
                <Route path="/casos-exito" element={<CasosExito />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/programa-colaboradores" element={<ProgramaColaboradores />} />
                
                {/* Por Qué Elegirnos routes */}
                <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
                
                {/* Servicios routes */}
                <Route path="/servicios/valoraciones" element={<Valoraciones />} />
                <Route path="/servicios/asesoramiento-legal" element={<AsesoramientoLegal />} />
                <Route path="/servicios/planificacion-fiscal" element={<PlanificacionFiscal />} />
                <Route path="/servicios/due-diligence" element={<DueDiligence />} />
                <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
                
                {/* Sectores routes - Updated and new */}
                <Route path="/sectores/healthcare" element={<Healthcare />} />
                <Route path="/sectores/industrial" element={<Industrial />} />
                <Route path="/sectores/tecnologia" element={<Tecnologia />} />
                <Route path="/sectores/financial-services" element={<FinancialServices />} />
                <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
                <Route path="/sectores/energia" element={<Energia />} />
                <Route path="/sectores/inmobiliario" element={<Inmobiliario />} />
                
                {/* Recursos routes */}
                <Route path="/recursos/blog" element={<Blog />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Documentación M&A routes */}
                <Route path="/documentacion-ma" element={<DocumentacionMA />} />
                <Route path="/documentacion-ma/nuestro-metodo" element={<NuestroMetodo />} />
                <Route path="/documentacion-ma/conoce-equipo" element={<ConoceEquipo />} />
                <Route path="/documentacion-ma/resultados" element={<Resultados />} />
                <Route path="/documentacion-ma/fase-1" element={<Fase1 />} />
                <Route path="/documentacion-ma/fase-2-lucha" element={<Fase2Lucha />} />
                <Route path="/documentacion-ma/dynamic-components" element={<DynamicComponents />} />
                <Route path="/documentacion-ma/customization" element={<Customization />} />
                <Route path="/documentacion-ma/typography" element={<Typography />} />
                <Route path="/documentacion-ma/spacing" element={<Spacing />} />
                <Route path="/documentacion-ma/variables" element={<Variables />} />
                
                <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
                <Route path="/terminos-uso" element={<TerminosUso />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AdminAccess />
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundaryProvider>
    </QueryClientProvider>
  );
}

export default App;
