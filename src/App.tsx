
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Páginas principales
import Nosotros from "./pages/Nosotros";
import CasosExito from "./pages/CasosExito";
import Equipo from "./pages/Equipo";
import Contacto from "./pages/Contacto";
import VentaEmpresas from "./pages/VentaEmpresas";
import CalculadoraValoracion from "./pages/CalculadoraValoracion";

// Por Qué Elegirnos
import PorQueElegirnos from "./pages/por-que-elegirnos";
import Experiencia from "./pages/por-que-elegirnos/experiencia";
import Metodologia from "./pages/por-que-elegirnos/metodologia";
import Resultados from "./pages/por-que-elegirnos/resultados";

// Servicios
import FusionesAdquisiciones from "./pages/servicios/FusionesAdquisiciones";
import DueDiligence from "./pages/servicios/DueDiligence";
import Valoraciones from "./pages/servicios/Valoraciones";
import CorporateFinance from "./pages/servicios/CorporateFinance";
import Reestructuraciones from "./pages/servicios/Reestructuraciones";

// Sectores
import Tecnologia from "./pages/sectores/Tecnologia";
import Healthcare from "./pages/sectores/Healthcare";
import Industrial from "./pages/sectores/Industrial";
import RetailConsumer from "./pages/sectores/RetailConsumer";
import FinancialServices from "./pages/sectores/FinancialServices";

// Recursos
import MarketReports from "./pages/recursos/MarketReports";
import Webinars from "./pages/recursos/Webinars";
import CaseStudies from "./pages/recursos/CaseStudies";
import Newsletter from "./pages/recursos/Newsletter";
import Blog from "./pages/recursos/Blog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Páginas principales */}
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/casos-exito" element={<CasosExito />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/venta-empresas" element={<VentaEmpresas />} />
          <Route path="/calculadora-valoracion" element={<CalculadoraValoracion />} />
          
          {/* Por Qué Elegirnos */}
          <Route path="/por-que-elegirnos" element={<PorQueElegirnos />} />
          <Route path="/por-que-elegirnos/experiencia" element={<Experiencia />} />
          <Route path="/por-que-elegirnos/metodologia" element={<Metodologia />} />
          <Route path="/por-que-elegirnos/resultados" element={<Resultados />} />
          
          {/* Servicios */}
          <Route path="/servicios/fusiones-adquisiciones" element={<FusionesAdquisiciones />} />
          <Route path="/servicios/due-diligence" element={<DueDiligence />} />
          <Route path="/servicios/valoraciones" element={<Valoraciones />} />
          <Route path="/servicios/corporate-finance" element={<CorporateFinance />} />
          <Route path="/servicios/reestructuraciones" element={<Reestructuraciones />} />
          
          {/* Sectores */}
          <Route path="/sectores/tecnologia" element={<Tecnologia />} />
          <Route path="/sectores/healthcare" element={<Healthcare />} />
          <Route path="/sectores/industrial" element={<Industrial />} />
          <Route path="/sectores/retail-consumer" element={<RetailConsumer />} />
          <Route path="/sectores/financial-services" element={<FinancialServices />} />
          
          {/* Recursos */}
          <Route path="/recursos/market-reports" element={<MarketReports />} />
          <Route path="/recursos/webinars" element={<Webinars />} />
          <Route path="/recursos/case-studies" element={<CaseStudies />} />
          <Route path="/recursos/newsletter" element={<Newsletter />} />
          <Route path="/recursos/blog" element={<Blog />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
