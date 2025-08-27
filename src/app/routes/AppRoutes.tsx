// ============= APP ROUTES =============
// Centralized routing configuration

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import * as Pages from '@/config/routes';

export const AppRoutes = () => {
  // Host-based redirects
  if (typeof window !== 'undefined') {
    const rawHost = window.location.hostname;
    const host = rawHost.replace(/^www\./, '');
    const path = window.location.pathname;

    // Si entran por calculadoras.capittal.es, forzamos dominio canónico
    if (host === 'calculadoras.capittal.es' || host === 'calculadora.capittal.es') {
      const canonical = 'https://capittal.es/lp/calculadora';
      if (window.location.href !== canonical) {
        window.location.replace(canonical);
        return null;
      }
    }

    // Redirecciones internas por host
    const hostRedirects: Record<string, string> = {
      'webcapittal.lovable.app': '/lp/calculadora',
    };

    const target = hostRedirects[host];
    if (target && path !== target) {
      return <Navigate to={target} replace />;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Pages.Index />} />
      <Route path="/auth" element={<Pages.AuthPage />} />
      <Route path="/admin/*" element={<Pages.Admin />} />
      
      {/* Core business pages */}
      <Route path="/venta-empresas" element={<Pages.VentaEmpresas />} />
      <Route path="/compra-empresas" element={<Pages.CompraEmpresas />} />
      <Route path="/contacto" element={<Pages.Contacto />} />
      <Route path="/programa-colaboradores" element={<Pages.ProgramaColaboradores />} />
      <Route path="/casos-exito" element={<Pages.CasosExito />} />
      <Route path="/nosotros" element={<Pages.Nosotros />} />
      <Route path="/equipo" element={<Pages.Equipo />} />
      
      {/* Calculator routes - all redirect to V4 */}
      <Route path="/calculadora-valoracion" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/calculadora-valoracion-v2" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/calculadora-valoracion-v3" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/calculadora-standalone" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/calculadora-master" element={<Pages.CalculadoraMaster />} />
      <Route path="/simulador-venta/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/simulador-ultra-rapido/:clientId" element={<Navigate to="/lp/calculadora" replace />} />
      
      {/* Landing Pages - V4 calculator */}
      <Route path="/lp" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/lp/*" element={<Navigate to="/lp/calculadora" replace />} />
      <Route path="/lp/calculadora" element={<Pages.LandingCalculator />} />
      <Route path="/lp/calculadora/*" element={<Pages.LandingCalculator />} />
      <Route path="/lp/calculadora-fiscal" element={<Pages.LandingCalculadoraFiscal />} />
      <Route path="/lp/calculadora-fiscal/*" element={<Pages.LandingCalculadoraFiscal />} />
      <Route path="/lp/reservar-cita" element={<Pages.BookingPage />} />
      
      {/* Service routes */}
      <Route path="/servicios/valoraciones" element={<Pages.Valoraciones />} />
      <Route path="/servicios/venta-empresas" element={<Pages.VentaEmpresas />} />
      <Route path="/servicios/due-diligence" element={<Pages.DueDiligence />} />
      <Route path="/servicios/asesoramiento-legal" element={<Pages.AsesoramientoLegal />} />
      <Route path="/servicios/reestructuraciones" element={<Pages.Reestructuraciones />} />
      <Route path="/servicios/planificacion-fiscal" element={<Pages.PlanificacionFiscal />} />
      
      {/* Legal routes */}
      <Route path="/politica-privacidad" element={<Pages.PoliticaPrivacidad />} />
      <Route path="/terminos-uso" element={<Pages.TerminosUso />} />
      <Route path="/cookies" element={<Pages.Cookies />} />
      
      {/* 404 route */}
      <Route path="*" element={<Pages.NotFound />} />
    </Routes>
  );
};