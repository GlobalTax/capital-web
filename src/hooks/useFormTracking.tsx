
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FormEvent {
  id: string;
  form_type: string;
  event_type: 'start' | 'field_change' | 'validation_error' | 'submit' | 'complete' | 'abandon';
  field_name?: string;
  field_value?: string;
  error_message?: string;
  session_id: string;
  visitor_id: string;
  page_path: string;
  timestamp: string;
  user_agent?: string;
  ip_address?: string;
}

export interface FormAnalytics {
  form_type: string;
  total_starts: number;
  total_completions: number;
  conversion_rate: number;
  avg_completion_time: number;
  abandonment_rate: number;
  most_abandoned_field?: string;
}

export const useFormTracking = (formType: string) => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [visitorId] = useState(() => localStorage.getItem('visitor_id') || crypto.randomUUID());
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Asegurar visitor_id en localStorage
  useEffect(() => {
    if (!localStorage.getItem('visitor_id')) {
      localStorage.setItem('visitor_id', visitorId);
    }
  }, [visitorId]);

  const trackEvent = useCallback(async (
    eventType: FormEvent['event_type'],
    fieldName?: string,
    fieldValue?: string,
    errorMessage?: string
  ) => {
    try {
      const event: Omit<FormEvent, 'id'> = {
        form_type: formType,
        event_type: eventType,
        field_name: fieldName,
        field_value: fieldValue?.substring(0, 100), // Limitar longitud
        error_message: errorMessage,
        session_id: sessionId,
        visitor_id: visitorId,
        page_path: window.location.pathname,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
      };

      // Guardar evento en base de datos
      const { error } = await supabase
        .from('form_tracking_events')
        .insert([event]);

      if (error) {
        console.error('Error tracking form event:', error);
      }

      // Eventos especiales
      if (eventType === 'start') {
        setStartTime(new Date());
      }

      if (eventType === 'complete') {
        toast({
          title: "✅ Formulario Completado",
          description: `${formType} enviado correctamente`,
          duration: 3000,
        });
      }

    } catch (error) {
      console.error('Error in form tracking:', error);
    }
  }, [formType, sessionId, visitorId, toast]);

  const trackStart = useCallback(() => trackEvent('start'), [trackEvent]);
  const trackFieldChange = useCallback((fieldName: string, value: string) => 
    trackEvent('field_change', fieldName, value), [trackEvent]);
  const trackValidationError = useCallback((fieldName: string, error: string) => 
    trackEvent('validation_error', fieldName, undefined, error), [trackEvent]);
  const trackSubmit = useCallback(() => trackEvent('submit'), [trackEvent]);
  const trackComplete = useCallback(() => trackEvent('complete'), [trackEvent]);
  const trackAbandon = useCallback((fieldName?: string) => 
    trackEvent('abandon', fieldName), [trackEvent]);

  // Track abandon al salir de la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (startTime && !document.hidden) {
        trackAbandon();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [startTime, trackAbandon]);

  return {
    sessionId,
    visitorId,
    trackStart,
    trackFieldChange,
    trackValidationError,
    trackSubmit,
    trackComplete,
    trackAbandon,
  };
};
