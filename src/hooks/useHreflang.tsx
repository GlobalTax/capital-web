import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface HreflangRoute {
  es: string;
  ca: string;
  en: string;
}

// Mapa completo de rutas multilingües
const routeMap: Record<string, HreflangRoute> = {
  // === MAIN PAGES ===
  '/': { es: '/', ca: '/ca', en: '/en' },
  '/ca': { es: '/', ca: '/ca', en: '/en' },
  '/inici': { es: '/', ca: '/inici', en: '/en' },
  '/en': { es: '/', ca: '/ca', en: '/en' },
  '/home': { es: '/', ca: '/ca', en: '/en' },
  
  // === BUSINESS PAGES ===
  '/venta-empresas': { es: '/venta-empresas', ca: '/venda-empreses', en: '/sell-companies' },
  '/venda-empreses': { es: '/venta-empresas', ca: '/venda-empreses', en: '/sell-companies' },
  '/sell-companies': { es: '/venta-empresas', ca: '/venda-empreses', en: '/sell-companies' },
  
  '/compra-empresas': { es: '/compra-empresas', ca: '/compra-empreses', en: '/buy-companies' },
  '/compra-empreses': { es: '/compra-empresas', ca: '/compra-empreses', en: '/buy-companies' },
  '/buy-companies': { es: '/compra-empresas', ca: '/compra-empreses', en: '/buy-companies' },
  
  '/contacto': { es: '/contacto', ca: '/contacte', en: '/contact' },
  '/contacte': { es: '/contacto', ca: '/contacte', en: '/contact' },
  '/contact': { es: '/contacto', ca: '/contacte', en: '/contact' },
  
  '/programa-colaboradores': { es: '/programa-colaboradores', ca: '/programa-col-laboradors', en: '/collaborators-program' },
  '/programa-col-laboradors': { es: '/programa-colaboradores', ca: '/programa-col-laboradors', en: '/collaborators-program' },
  '/collaborators-program': { es: '/programa-colaboradores', ca: '/programa-col-laboradors', en: '/collaborators-program' },
  
  '/casos-exito': { es: '/casos-exito', ca: '/casos-exit', en: '/success-stories' },
  '/casos-exit': { es: '/casos-exito', ca: '/casos-exit', en: '/success-stories' },
  '/success-stories': { es: '/casos-exito', ca: '/casos-exit', en: '/success-stories' },
  
  '/por-que-elegirnos': { es: '/por-que-elegirnos', ca: '/per-que-triar-nos', en: '/why-choose-us' },
  '/per-que-triar-nos': { es: '/por-que-elegirnos', ca: '/per-que-triar-nos', en: '/why-choose-us' },
  '/why-choose-us': { es: '/por-que-elegirnos', ca: '/per-que-triar-nos', en: '/why-choose-us' },
  
  '/equipo': { es: '/equipo', ca: '/equip', en: '/team' },
  '/equip': { es: '/equipo', ca: '/equip', en: '/team' },
  '/team': { es: '/equipo', ca: '/equip', en: '/team' },
  
  // === SERVICE PAGES ===
  '/servicios/valoraciones': { es: '/servicios/valoraciones', ca: '/serveis/valoracions', en: '/services/valuations' },
  '/serveis/valoracions': { es: '/servicios/valoraciones', ca: '/serveis/valoracions', en: '/services/valuations' },
  '/services/valuations': { es: '/servicios/valoraciones', ca: '/serveis/valoracions', en: '/services/valuations' },
  
  '/servicios/venta-empresas': { es: '/servicios/venta-empresas', ca: '/serveis/venda-empreses', en: '/services/sell-companies' },
  '/serveis/venda-empreses': { es: '/servicios/venta-empresas', ca: '/serveis/venda-empreses', en: '/services/sell-companies' },
  '/services/sell-companies': { es: '/servicios/venta-empresas', ca: '/serveis/venda-empreses', en: '/services/sell-companies' },
  
  '/servicios/due-diligence': { es: '/servicios/due-diligence', ca: '/serveis/due-diligence', en: '/services/due-diligence' },
  '/serveis/due-diligence': { es: '/servicios/due-diligence', ca: '/serveis/due-diligence', en: '/services/due-diligence' },
  '/services/due-diligence': { es: '/servicios/due-diligence', ca: '/serveis/due-diligence', en: '/services/due-diligence' },
  
  '/servicios/asesoramiento-legal': { es: '/servicios/asesoramiento-legal', ca: '/serveis/assessorament-legal', en: '/services/legal-advisory' },
  '/serveis/assessorament-legal': { es: '/servicios/asesoramiento-legal', ca: '/serveis/assessorament-legal', en: '/services/legal-advisory' },
  '/services/legal-advisory': { es: '/servicios/asesoramiento-legal', ca: '/serveis/assessorament-legal', en: '/services/legal-advisory' },
  
  '/servicios/reestructuraciones': { es: '/servicios/reestructuraciones', ca: '/serveis/reestructuracions', en: '/services/restructuring' },
  '/serveis/reestructuracions': { es: '/servicios/reestructuraciones', ca: '/serveis/reestructuracions', en: '/services/restructuring' },
  '/services/restructuring': { es: '/servicios/reestructuraciones', ca: '/serveis/reestructuracions', en: '/services/restructuring' },
  
  '/servicios/planificacion-fiscal': { es: '/servicios/planificacion-fiscal', ca: '/serveis/planificacio-fiscal', en: '/services/tax-planning' },
  '/serveis/planificacio-fiscal': { es: '/servicios/planificacion-fiscal', ca: '/serveis/planificacio-fiscal', en: '/services/tax-planning' },
  '/services/tax-planning': { es: '/servicios/planificacion-fiscal', ca: '/serveis/planificacio-fiscal', en: '/services/tax-planning' },
  
  // === SECTOR PAGES ===
  '/sectores/tecnologia': { es: '/sectores/tecnologia', ca: '/sectors/tecnologia', en: '/sectors/technology' },
  '/sectors/tecnologia': { es: '/sectores/tecnologia', ca: '/sectors/tecnologia', en: '/sectors/technology' },
  '/sectors/technology': { es: '/sectores/tecnologia', ca: '/sectors/tecnologia', en: '/sectors/technology' },
  
  '/sectores/healthcare': { es: '/sectores/healthcare', ca: '/sectors/salut', en: '/sectors/healthcare' },
  '/sectors/salut': { es: '/sectores/healthcare', ca: '/sectors/salut', en: '/sectors/healthcare' },
  '/sectors/healthcare': { es: '/sectores/healthcare', ca: '/sectors/salut', en: '/sectors/healthcare' },
  
  
  '/sectores/industrial': { es: '/sectores/industrial', ca: '/sectors/industrial', en: '/sectors/industrial' },
  '/sectors/industrial': { es: '/sectores/industrial', ca: '/sectors/industrial', en: '/sectors/industrial' },
  
  '/sectores/retail-consumer': { es: '/sectores/retail-consumer', ca: '/sectors/retail-consum', en: '/sectors/retail-consumer' },
  '/sectors/retail-consum': { es: '/sectores/retail-consumer', ca: '/sectors/retail-consum', en: '/sectors/retail-consumer' },
  '/sectors/retail-consumer': { es: '/sectores/retail-consumer', ca: '/sectors/retail-consum', en: '/sectors/retail-consumer' },
  
  '/sectores/energia': { es: '/sectores/energia', ca: '/sectors/energia', en: '/sectors/energy' },
  '/sectors/energia': { es: '/sectores/energia', ca: '/sectors/energia', en: '/sectors/energy' },
  '/sectors/energy': { es: '/sectores/energia', ca: '/sectors/energia', en: '/sectors/energy' },
  
  
  // === LANDING PAGES ===
  '/lp/calculadora': { es: '/lp/calculadora', ca: '/lp/calculadora', en: '/lp/calculadora' },
  '/lp/calculadora-fiscal': { es: '/lp/calculadora-fiscal', ca: '/lp/calculadora-fiscal', en: '/lp/calculadora-fiscal' },
  '/lp/calculadora-asesores': { es: '/lp/calculadora-asesores', ca: '/lp/calculadora-asesores', en: '/lp/calculadora-asesores' },
};

interface UseHreflangOptions {
  baseUrl?: string;
  forceCanonical?: string;
}

export const useHreflang = (options: UseHreflangOptions = {}) => {
  const location = useLocation();
  const baseUrl = options.baseUrl || 'https://capittal.es';
  
  useEffect(() => {
    const currentPath = location.pathname;
    const routes = routeMap[currentPath];
    
    // Si la ruta no está en el mapa, usar la ruta actual como fallback
    const fallbackRoutes = {
      es: currentPath,
      ca: currentPath,
      en: currentPath
    };
    
    const hreflangRoutes = routes || fallbackRoutes;
    
    // Limpiar hreflang links existentes
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach(link => link.remove());
    
    // Añadir nuevos hreflang links
    const languages: Array<'es' | 'ca' | 'en'> = ['es', 'ca', 'en'];
    languages.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', `${baseUrl}${hreflangRoutes[lang]}`);
      document.head.appendChild(link);
    });
    
    // Añadir x-default (español como predeterminado)
    const xDefaultLink = document.createElement('link');
    xDefaultLink.setAttribute('rel', 'alternate');
    xDefaultLink.setAttribute('hreflang', 'x-default');
    xDefaultLink.setAttribute('href', `${baseUrl}${hreflangRoutes.es}`);
    document.head.appendChild(xDefaultLink);
    
    // Actualizar canonical URL
    const canonicalUrl = options.forceCanonical || `${baseUrl}${currentPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
    
    // Cleanup
    return () => {
      const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
      links.forEach(link => link.remove());
    };
  }, [location.pathname, baseUrl, options.forceCanonical]);
  
  return {
    currentPath: location.pathname,
    routes: routeMap[location.pathname] || { es: location.pathname, ca: location.pathname, en: location.pathname }
  };
};
