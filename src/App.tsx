
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import VentaEmpresas from '@/pages/VentaEmpresas';
import CompraEmpresas from '@/pages/CompraEmpresas';
import ValoracionEmpresas from '@/pages/ValoracionEmpresas';
import DueDiligence from '@/pages/DueDiligence';
import SectorTecnologia from '@/pages/sectors/SectorTecnologia';
import SectorSalud from '@/pages/sectors/SectorSalud';
import SectorIndustrial from '@/pages/sectors/SectorIndustrial';
import SectorLogistica from '@/pages/sectors/SectorLogistica';
import SectorEducacion from '@/pages/sectors/SectorEducacion';
import SectorEnergia from '@/pages/sectors/SectorEnergia';
import ContactPage from '@/pages/ContactPage';
import BlogPage from '@/pages/BlogPage';
import AdminPage from '@/pages/admin/AdminPage';
import LandingPagesPage from '@/pages/admin/LandingPagesPage';
import LandingPageView from '@/pages/LandingPageView';
import NotFound from '@/pages/NotFound';
import ScrollToTop from '@/components/ScrollToTop';
import AccessibilityTools from '@/components/AccessibilityTools';
import ErrorBoundaryProvider from '@/components/ErrorBoundaryProvider';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { AuthProvider } from '@/contexts/AuthContext';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ErrorBoundaryProvider>
            <LeadTrackingProvider>
              <div className="min-h-screen bg-background text-foreground">
                <ScrollToTop />
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/venta-empresas" element={<VentaEmpresas />} />
                    <Route path="/compra-empresas" element={<CompraEmpresas />} />
                    <Route path="/servicios/valoraciones" element={<ValoracionEmpresas />} />
                    <Route path="/servicios/due-diligence" element={<DueDiligence />} />
                    <Route path="/sectores/tecnologia" element={<SectorTecnologia />} />
                    <Route path="/sectores/salud" element={<SectorSalud />} />
                    <Route path="/sectores/industrial" element={<SectorIndustrial />} />
                    <Route path="/sectores/logistica" element={<SectorLogistica />} />
                    <Route path="/sectores/educacion" element={<SectorEducacion />} />
                    <Route path="/sectores/energia" element={<SectorEnergia />} />
                    <Route path="/contacto" element={<ContactPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/admin/landing-pages" element={<LandingPagesPage />} />
                    <Route path="/landing/:slug" element={<LandingPageView />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <AccessibilityTools />
              </div>
            </LeadTrackingProvider>
          </ErrorBoundaryProvider>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
