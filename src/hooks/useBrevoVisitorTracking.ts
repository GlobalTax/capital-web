import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom Hook para Brevo Visitor Tracking
 * 
 * Captura y trackea datos completos de visitantes anónimos y registrados:
 * - visitor_id persistente (localStorage)
 * - session_id por sesión (sessionStorage)
 * - Device, browser, OS, screen, timezone
 * - Referrer, UTM params, page path
 * - Scroll depth, time on page
 * - Identificación progresiva cuando convierte
 * 
 * @example
 * const { trackVisitor, trackScrollDepth } = useBrevoVisitorTracking();
 * 
 * useEffect(() => {
 *   trackVisitor();
 * }, [trackVisitor]);
 */

interface VisitorData {
  visitor_id: string;
  session_id: string;
  device: string;
  browser: string;
  os: string;
  screen_resolution: string;
  language: string;
  timezone: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  page_path: string;
  entry_page: string;
  time_on_site: number;
  pages_visited: number;
  is_returning: boolean;
}

export const useBrevoVisitorTracking = () => {
  const location = useLocation();
  const pageLoadTime = useRef<number>(Date.now());
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const timeOnPageTracked = useRef<boolean>(false);

  /**
   * Genera o recupera visitor_id persistente
   */
  const getVisitorId = useCallback((): string => {
    let visitorId = localStorage.getItem('brevo_visitor_id');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('brevo_visitor_id', visitorId);
      localStorage.setItem('brevo_first_visit', new Date().toISOString());
    }
    return visitorId;
  }, []);

  /**
   * Genera o recupera session_id por sesión
   */
  const getSessionId = useCallback((): string => {
    let sessionId = sessionStorage.getItem('brevo_session_id');
    if (!sessionId) {
      sessionId = `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('brevo_session_id', sessionId);
      sessionStorage.setItem('brevo_session_start', new Date().toISOString());
      sessionStorage.setItem('brevo_entry_page', location.pathname);
    }
    return sessionId;
  }, [location.pathname]);

  /**
   * Detecta información del dispositivo y navegador
   */
  const getDeviceInfo = useCallback(() => {
    const ua = navigator.userAgent;
    
    // Detectar dispositivo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    // Detectar browser
    let browser = 'unknown';
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';

    // Detectar OS
    let os = 'unknown';
    if (ua.indexOf('Win') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';

    return { device, browser, os };
  }, []);

  /**
   * Extrae parámetros UTM de la URL
   */
  const getUtmParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined,
    };
  }, []);

  /**
   * Calcula tiempo en el sitio
   */
  const getTimeOnSite = useCallback((): number => {
    const sessionStart = sessionStorage.getItem('brevo_session_start');
    if (!sessionStart) return 0;
    return Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000);
  }, []);

  /**
   * Cuenta páginas visitadas en la sesión
   */
  const getPagesVisited = useCallback((): number => {
    const count = parseInt(sessionStorage.getItem('brevo_pages_visited') || '0');
    const newCount = count + 1;
    sessionStorage.setItem('brevo_pages_visited', newCount.toString());
    return newCount;
  }, []);

  /**
   * Verifica si es visitante recurrente
   */
  const isReturningVisitor = useCallback((): boolean => {
    const firstVisit = localStorage.getItem('brevo_first_visit');
    if (!firstVisit) return false;
    const daysSinceFirst = (Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceFirst > 0.1; // Más de ~2.4 horas
  }, []);

  /**
   * Recopila todos los datos del visitante
   */
  const collectVisitorData = useCallback((): VisitorData => {
    const { device, browser, os } = getDeviceInfo();
    const utmParams = getUtmParams();
    const entryPage = sessionStorage.getItem('brevo_entry_page') || location.pathname;

    return {
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      device,
      browser,
      os,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || 'direct',
      ...utmParams,
      page_path: location.pathname,
      entry_page: entryPage,
      time_on_site: getTimeOnSite(),
      pages_visited: getPagesVisited(),
      is_returning: isReturningVisitor(),
    };
  }, [
    location.pathname,
    getVisitorId,
    getSessionId,
    getDeviceInfo,
    getUtmParams,
    getTimeOnSite,
    getPagesVisited,
    isReturningVisitor,
  ]);

  /**
   * Trackea visitante en Brevo con todos los datos
   */
  const trackVisitor = useCallback(() => {
    if (!window.Brevo) {
      console.warn('[Brevo] SDK not loaded yet');
      return;
    }

    const visitorData = collectVisitorData();

    // Identificar visitante anónimo en Brevo
    window.Brevo.push(['identify', visitorData.visitor_id, {
      VISITOR_ID: visitorData.visitor_id,
      SESSION_ID: visitorData.session_id,
      DEVICE: visitorData.device,
      BROWSER: visitorData.browser,
      OS: visitorData.os,
      SCREEN_RESOLUTION: visitorData.screen_resolution,
      LANGUAGE: visitorData.language,
      TIMEZONE: visitorData.timezone,
      REFERRER: visitorData.referrer,
      UTM_SOURCE: visitorData.utm_source || '',
      UTM_MEDIUM: visitorData.utm_medium || '',
      UTM_CAMPAIGN: visitorData.utm_campaign || '',
      ENTRY_PAGE: visitorData.entry_page,
      PAGES_VISITED: visitorData.pages_visited,
      IS_RETURNING: visitorData.is_returning,
    }]);

    // Trackear page view con metadata
    window.Brevo.push(['trackEvent', 'page_view', {
      page_path: visitorData.page_path,
      visitor_id: visitorData.visitor_id,
      session_id: visitorData.session_id,
      time_on_site: visitorData.time_on_site,
      device: visitorData.device,
      is_returning: visitorData.is_returning,
    }]);

    console.log('[Brevo] Visitor tracked:', visitorData);
  }, [collectVisitorData]);

  /**
   * Trackea scroll depth (25%, 50%, 75%)
   */
  const trackScrollDepth = useCallback((percentage: number) => {
    if (!window.Brevo || scrollDepthTracked.current.has(percentage)) return;

    scrollDepthTracked.current.add(percentage);
    const visitorData = collectVisitorData();

    window.Brevo.push(['trackEvent', `scroll_depth_${percentage}`, {
      page_path: location.pathname,
      visitor_id: visitorData.visitor_id,
      session_id: visitorData.session_id,
      scroll_percentage: percentage,
    }]);

    console.log(`[Brevo] Scroll depth ${percentage}% tracked`);
  }, [location.pathname, collectVisitorData]);

  /**
   * Trackea tiempo en página (solo >30 segundos)
   */
  const trackTimeOnPage = useCallback(() => {
    if (!window.Brevo || timeOnPageTracked.current) return;

    const timeSpent = Math.floor((Date.now() - pageLoadTime.current) / 1000);
    if (timeSpent < 30) return;

    timeOnPageTracked.current = true;
    const visitorData = collectVisitorData();

    window.Brevo.push(['trackEvent', 'time_on_page', {
      page_path: location.pathname,
      visitor_id: visitorData.visitor_id,
      session_id: visitorData.session_id,
      time_spent_seconds: timeSpent,
    }]);

    console.log(`[Brevo] Time on page tracked: ${timeSpent}s`);
  }, [location.pathname, collectVisitorData]);

  /**
   * Setup scroll tracking
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercentage >= 25 && !scrollDepthTracked.current.has(25)) {
        trackScrollDepth(25);
      }
      if (scrollPercentage >= 50 && !scrollDepthTracked.current.has(50)) {
        trackScrollDepth(50);
      }
      if (scrollPercentage >= 75 && !scrollDepthTracked.current.has(75)) {
        trackScrollDepth(75);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  /**
   * Setup time on page tracking (30 segundos)
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      trackTimeOnPage();
    }, 30000);

    return () => clearTimeout(timer);
  }, [trackTimeOnPage]);

  /**
   * Reset tracking al cambiar de página
   */
  useEffect(() => {
    pageLoadTime.current = Date.now();
    scrollDepthTracked.current.clear();
    timeOnPageTracked.current = false;
  }, [location.pathname]);

  return {
    trackVisitor,
    trackScrollDepth,
    trackTimeOnPage,
    getVisitorId,
    getSessionId,
  };
};
