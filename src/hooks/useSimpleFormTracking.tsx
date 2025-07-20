
import { logger } from '@/utils/logger';

export const useSimpleFormTracking = () => {
  const trackFormSubmission = (formType: string, formData?: any) => {
    logger.info('Form submission tracked', { formType, formData }, { context: 'form', component: 'useSimpleFormTracking' });
  };

  const trackFormInteraction = (formType: string, field: string) => {
    logger.debug('Form interaction tracked', { formType, field }, { context: 'form', component: 'useSimpleFormTracking' });
  };

  const trackEvent = (eventName: string, eventData?: any) => {
    logger.info('Event tracked', { eventName, eventData }, { context: 'marketing', component: 'useSimpleFormTracking' });
  };

  return {
    trackFormSubmission,
    trackFormInteraction,
    trackEvent
  };
};
