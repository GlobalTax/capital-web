// Hook simplificado para tracking básico de formularios
export const useSimpleFormTracking = () => {
  const trackFormSubmission = (formType: string, formData?: any) => {
    console.log(`Form submission tracked: ${formType}`, formData);
  };

  const trackFormInteraction = (formType: string, field: string) => {
    console.log(`Form interaction tracked: ${formType} - ${field}`);
  };

  const trackEvent = (eventName: string, eventData?: any) => {
    console.log(`Event tracked: ${eventName}`, eventData);
  };

  return {
    trackFormSubmission,
    trackFormInteraction,
    trackEvent
  };
};