
import { useCallback } from 'react';
import { useAdvancedLeadScoring } from './useAdvancedLeadScoring';

// Hook para trackear automáticamente eventos específicos de la aplicación
export const useLeadScoringTracking = () => {
  const { 
    trackPageView, 
    trackCalculatorUse, 
    trackFormFill, 
    trackDownload 
  } = useAdvancedLeadScoring();

  // Trackear uso específico de calculadora de valoración
  const trackValuationCalculatorStart = useCallback((calculatorData: {
    industry: string;
    revenue?: number;
    employeeRange: string;
  }) => {
    trackCalculatorUse({
      action: 'calculator_started',
      calculator_type: 'valuation',
      ...calculatorData,
      timestamp: new Date().toISOString()
    });
  }, [trackCalculatorUse]);

  const trackValuationCalculatorComplete = useCallback((calculatorData: {
    industry: string;
    revenue?: number;
    employeeRange: string;
    finalValuation?: number;
  }) => {
    trackCalculatorUse({
      action: 'calculator_completed',
      calculator_type: 'valuation',
      ...calculatorData,
      timestamp: new Date().toISOString()
    });
  }, [trackCalculatorUse]);

  // Trackear formularios específicos
  const trackContactFormSubmit = useCallback((formData: {
    fullName: string;
    email: string;
    company: string;
    companySize?: string;
    country?: string;
  }) => {
    trackFormFill({
      form_type: 'contact',
      form_location: 'contact_page',
      has_email: !!formData.email,
      has_company: !!formData.company,
      company_size: formData.companySize,
      timestamp: new Date().toISOString()
    });
  }, [trackFormFill]);

  const trackCollaboratorApplicationSubmit = useCallback((formData: {
    fullName: string;
    email: string;
    profession: string;
    experience?: string;
  }) => {
    trackFormFill({
      form_type: 'collaborator_application',
      form_location: 'collaborator_page',
      profession: formData.profession,
      has_experience: !!formData.experience,
      timestamp: new Date().toISOString()
    });
  }, [trackFormFill]);

  // Trackear descargas de lead magnets
  const trackLeadMagnetDownload = useCallback((downloadData: {
    leadMagnetId: string;
    leadMagnetTitle: string;
    leadMagnetType: string;
    sector: string;
    userEmail: string;
    userCompany?: string;
  }) => {
    trackDownload({
      download_type: 'lead_magnet',
      lead_magnet_id: downloadData.leadMagnetId,
      lead_magnet_title: downloadData.leadMagnetTitle,
      lead_magnet_type: downloadData.leadMagnetType,
      sector: downloadData.sector,
      has_company_info: !!downloadData.userCompany,
      timestamp: new Date().toISOString()
    });
  }, [trackDownload]);

  // Trackear eventos de alta intención
  const trackHighIntentAction = useCallback((action: string, data: Record<string, any> = {}) => {
    // Estos eventos reciben puntuación alta automáticamente
    const highIntentActions = {
      'pricing_page_visit': () => trackPageView('/precios'),
      'service_inquiry': () => trackFormFill({
        form_type: 'service_inquiry',
        ...data,
        timestamp: new Date().toISOString()
      }),
      'case_study_download': () => trackDownload({
        download_type: 'case_study',
        ...data,
        timestamp: new Date().toISOString()
      }),
      'calculator_multiple_uses': () => trackCalculatorUse({
        action: 'multiple_uses',
        usage_count: data.usageCount || 1,
        timestamp: new Date().toISOString()
      })
    };

    const trackingFunction = highIntentActions[action as keyof typeof highIntentActions];
    if (trackingFunction) {
      trackingFunction();
    }
  }, [trackPageView, trackFormFill, trackDownload, trackCalculatorUse]);

  // Trackear patrones de navegación específicos
  const trackNavigationPattern = useCallback((pattern: {
    pages: string[];
    timeSpent: number;
    bounced: boolean;
  }) => {
    const isHighIntentPattern = pattern.pages.some(page => 
      page.includes('valoracion') || 
      page.includes('calculadora') || 
      page.includes('contacto') ||
      page.includes('servicios')
    );

    if (isHighIntentPattern && pattern.timeSpent > 120) { // Más de 2 minutos
      trackHighIntentAction('high_engagement_navigation', {
        pages_visited: pattern.pages.length,
        time_spent: pattern.timeSpent,
        engagement_type: 'deep_navigation'
      });
    }
  }, [trackHighIntentAction]);

  return {
    // Tracking específico de calculadora
    trackValuationCalculatorStart,
    trackValuationCalculatorComplete,
    
    // Tracking de formularios
    trackContactFormSubmit,
    trackCollaboratorApplicationSubmit,
    
    // Tracking de descargas
    trackLeadMagnetDownload,
    
    // Tracking de alta intención
    trackHighIntentAction,
    trackNavigationPattern,
  };
};
