import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Nosotros from '@/pages/Nosotros';
import Equipo from '@/pages/Equipo';
import Contacto from '@/pages/Contacto';
import CalculadoraValoracion from '@/pages/CalculadoraValoracion';
import VentaEmpresas from '@/pages/VentaEmpresas';
import CompraEmpresas from '@/pages/CompraEmpresas';
import CasosExito from '@/pages/CasosExito';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import PoliticaPrivacidad from '@/pages/PoliticaPrivacidad';
import TerminosUso from '@/pages/TerminosUso';
import Cookies from '@/pages/Cookies';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/calculadora-valoracion" element={<CalculadoraValoracion />} />
          <Route path="/venta-empresas" element={<VentaEmpresas />} />
          <Route path="/compra-empresas" element={<CompraEmpresas />} />
          <Route path="/casos-exito" element={<CasosExito />} />
          <Route path="/admin" element={<Admin />} />
          
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-uso" element={<TerminosUso />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
