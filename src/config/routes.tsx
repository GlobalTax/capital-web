import { lazy } from 'react';

// Core pages - only keep essential ones
const Index = lazy(() => import('@/pages/Index'));
const Admin = lazy(() => import('@/pages/Admin'));
const AuthPage = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Calculator - only V4
const CalculadoraValoracionV4 = lazy(() => import('@/pages/CalculadoraValoracionV4'));
const CalculadoraMaster = lazy(() => import('@/pages/CalculadoraMaster'));
const CalculadoraSimple = lazy(() => import('@/pages/CalculadoraSimple'));

// Essential pages
const VentaEmpresas = lazy(() => import('@/pages/VentaEmpresas'));
const CompraEmpresas = lazy(() => import('@/pages/CompraEmpresas'));
const Contacto = lazy(() => import('@/pages/Contacto'));
const ProgramaColaboradores = lazy(() => import('@/pages/ProgramaColaboradores'));
const CasosExito = lazy(() => import('@/pages/CasosExito'));
const Nosotros = lazy(() => import('@/pages/Nosotros'));
const Equipo = lazy(() => import('@/pages/Equipo'));

// Landing Pages
const LandingCalculator = lazy(() => import('@/pages/LandingCalculator'));
const LandingCalculadoraFiscal = lazy(() => import('@/pages/LandingCalculadoraFiscal'));
const BookingPage = lazy(() => import('@/pages/BookingPage'));

// Service pages - with fallbacks
const Valoraciones = lazy(() => import('@/pages/servicios/Valoraciones').catch(() => 
  import('@/pages/VentaEmpresas')
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

// Legal pages
const PoliticaPrivacidad = lazy(() => import('@/pages/PoliticaPrivacidad').catch(() => 
  import('@/pages/VentaEmpresas')
));
const TerminosUso = lazy(() => import('@/pages/TerminosUso').catch(() => 
  import('@/pages/VentaEmpresas')
));
const Cookies = lazy(() => import('@/pages/Cookies').catch(() => 
  import('@/pages/VentaEmpresas')
));

export {
  Index,
  Admin,
  AuthPage,
  NotFound,
  CalculadoraValoracionV4,
  CalculadoraMaster,
  CalculadoraSimple,
  VentaEmpresas,
  CompraEmpresas,
  Contacto,
  ProgramaColaboradores,
  CasosExito,
  Nosotros,
  Equipo,
  LandingCalculator,
  LandingCalculadoraFiscal,
  BookingPage,
  Valoraciones,
  DueDiligence,
  AsesoramientoLegal,
  Reestructuraciones,
  PlanificacionFiscal,
  PoliticaPrivacidad,
  TerminosUso,
  Cookies
};
