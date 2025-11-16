import { useCallback } from 'react';

/**
 * Custom Hook para Brevo Tracking
 * 
 * Gestiona eventos personalizados de Brevo para:
 * - Valoraciones completadas
 * - Identificación de contactos
 * - Descargas de PDF
 * - Envíos de formularios
 * 
 * @example
 * const { trackValuationCompleted, identifyContact } = useBrevoTracking();
 * 
 * // Al completar valoración
 * trackValuationCompleted({
 *   sector: 'Tecnología',
 *   value: 1500000,
 *   employeeRange: '10-50'
 * });
 * 
 * // Identificar contacto
 * identifyContact('user@example.com', {
 *   empresa: 'Tech Corp',
 *   sector: 'Tecnología'
 * });
 */
export const useBrevoTracking = () => {
  /**
   * Trackear valoración completada
   */
  const trackValuationCompleted = useCallback((data: {
    sector: string;
    value: number;
    employeeRange: string;
    revenue?: number;
    ebitda?: number;
  }) => {
    if (window.Brevo) {
      window.Brevo.push(['trackEvent', 'valuation_completed', {
        company_sector: data.sector,
        estimated_value: data.value,
        employee_range: data.employeeRange,
        revenue: data.revenue || 0,
        ebitda: data.ebitda || 0,
      }]);
      console.log('[Brevo] Valuation completed tracked:', data);
    }
  }, []);

  /**
   * Identificar contacto en Brevo con unificación progresiva
   */
  const identifyContact = useCallback((email: string, attributes: {
    empresa?: string;
    nombre?: string;
    telefono?: string;
    sector?: string;
    [key: string]: any;
  }) => {
    if (window.Brevo) {
      // Recuperar visitor_id previo para unificación
      const previousVisitorId = localStorage.getItem('brevo_visitor_id');
      const sessionId = sessionStorage.getItem('brevo_session_id');

      window.Brevo.push(['identify', email, {
        EMAIL: email,
        EMPRESA: attributes.empresa || '',
        NOMBRE: attributes.nombre || '',
        TELEFONO: attributes.telefono || '',
        SECTOR: attributes.sector || '',
        PREVIOUS_VISITOR_ID: previousVisitorId || '',
        SESSION_ID: sessionId || '',
        CONVERSION_PAGE: window.location.pathname,
        CONVERTED_AT: new Date().toISOString(),
        ...attributes,
      }]);
      console.log('[Brevo] Contact identified with progressive unification:', email, {
        previousVisitorId,
        sessionId,
        attributes
      });
    }
  }, []);

  /**
   * Trackear descarga de PDF
   */
  const trackPDFDownload = useCallback((fileName: string, valuationId?: string) => {
    if (window.Brevo) {
      window.Brevo.push(['trackEvent', 'pdf_download', {
        file_name: fileName,
        valuation_id: valuationId || '',
      }]);
      console.log('[Brevo] PDF download tracked:', fileName);
    }
  }, []);

  /**
   * Trackear envío de formulario
   */
  const trackFormSubmission = useCallback((formName: string, formData?: any) => {
    if (window.Brevo) {
      window.Brevo.push(['trackEvent', 'form_submission', {
        form_name: formName,
        ...formData,
      }]);
      console.log('[Brevo] Form submission tracked:', formName);
    }
  }, []);

  /**
   * Trackear solicitud de contacto
   */
  const trackContactRequest = useCallback((type: 'valuation' | 'general' | 'acquisition') => {
    if (window.Brevo) {
      window.Brevo.push(['trackEvent', 'contact_request', {
        request_type: type,
      }]);
      console.log('[Brevo] Contact request tracked:', type);
    }
  }, []);

  /**
   * Trackear evento de página vista (opcional, ya se hace automáticamente)
   */
  const trackPageView = useCallback((pageName?: string) => {
    if (window.Brevo) {
      window.Brevo.push(['trackEvent', 'page_view', {
        page_name: pageName || window.location.pathname,
      }]);
    }
  }, []);

  return {
    trackValuationCompleted,
    identifyContact,
    trackPDFDownload,
    trackFormSubmission,
    trackContactRequest,
    trackPageView,
  };
};
