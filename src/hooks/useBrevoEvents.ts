import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook para tracking de eventos en Brevo
 * 
 * Permite registrar eventos críticos del backend en Brevo Events API
 * para trigger de automatizaciones, lead scoring y personalización.
 */

interface TrackEventOptions {
  showToast?: boolean;
  silent?: boolean;
}

interface EventResult {
  success: boolean;
  error?: string;
}

export const useBrevoEvents = () => {
  const [isTracking, setIsTracking] = useState(false);

  /**
   * Función base para enviar eventos a Brevo
   */
  const trackEvent = useCallback(async (
    email: string,
    event: string,
    eventdata: Record<string, any> = {},
    options: TrackEventOptions = {}
  ): Promise<EventResult> => {
    const { showToast = false, silent = true } = options;

    if (!email) {
      console.warn('useBrevoEvents: No email provided for event tracking');
      return { success: false, error: 'No email provided' };
    }

    setIsTracking(true);

    try {
      const { data, error } = await supabase.functions.invoke('brevo-track-event', {
        body: {
          email,
          event,
          eventdata: {
            ...eventdata,
            tracked_at: new Date().toISOString(),
          },
        },
      });

      if (error) {
        console.error('Error tracking Brevo event:', error);
        if (!silent && showToast) {
          toast.error('Error al registrar evento');
        }
        return { success: false, error: error.message };
      }

      if (!silent) {
        console.log(`✅ Brevo event tracked: ${event} for ${email}`);
      }

      if (showToast) {
        toast.success('Evento registrado en Brevo');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Exception tracking Brevo event:', err);
      return { success: false, error: err.message };
    } finally {
      setIsTracking(false);
    }
  }, []);

  /**
   * Registrar cambio de estado del lead
   */
  const trackLeadStatusChange = useCallback(async (
    email: string,
    leadId: string,
    oldStatus: string,
    newStatus: string,
    leadType: string = 'valuation',
    changedBy?: string
  ): Promise<EventResult> => {
    return trackEvent(email, 'lead_status_changed', {
      lead_id: leadId,
      lead_type: leadType,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: changedBy || 'admin',
    });
  }, [trackEvent]);

  /**
   * Registrar valoración completada
   */
  const trackValuationCompleted = useCallback(async (
    email: string,
    valuationId: string,
    companyName: string,
    finalValuation?: number,
    industry?: string
  ): Promise<EventResult> => {
    return trackEvent(email, 'valuation_completed', {
      valuation_id: valuationId,
      company_name: companyName,
      final_valuation: finalValuation,
      industry: industry,
    });
  }, [trackEvent]);

  /**
   * Registrar reunión agendada
   */
  const trackMeetingScheduled = useCallback(async (
    email: string,
    bookingId: string,
    meetingType: string,
    meetingDate: string,
    companyName?: string
  ): Promise<EventResult> => {
    return trackEvent(email, 'meeting_scheduled', {
      booking_id: bookingId,
      meeting_type: meetingType,
      meeting_date: meetingDate,
      company_name: companyName,
    });
  }, [trackEvent]);

  /**
   * Registrar documento visto/descargado
   */
  const trackDocumentViewed = useCallback(async (
    email: string,
    documentId: string,
    documentName: string,
    documentType: string,
    relatedEntityId?: string
  ): Promise<EventResult> => {
    return trackEvent(email, 'document_viewed', {
      document_id: documentId,
      document_name: documentName,
      document_type: documentType,
      related_entity_id: relatedEntityId,
    });
  }, [trackEvent]);

  /**
   * Registrar empresa vinculada al lead
   */
  const trackCompanyLinked = useCallback(async (
    email: string,
    leadId: string,
    empresaId: string,
    empresaName: string,
    leadType: string = 'valuation'
  ): Promise<EventResult> => {
    return trackEvent(email, 'company_linked', {
      lead_id: leadId,
      lead_type: leadType,
      empresa_id: empresaId,
      empresa_name: empresaName,
    });
  }, [trackEvent]);

  /**
   * Registrar tarea completada
   */
  const trackTaskCompleted = useCallback(async (
    email: string,
    taskId: string,
    taskName: string,
    leadId: string,
    leadType: string = 'valuation'
  ): Promise<EventResult> => {
    return trackEvent(email, 'task_completed', {
      task_id: taskId,
      task_name: taskName,
      lead_id: leadId,
      lead_type: leadType,
    });
  }, [trackEvent]);

  /**
   * Registrar nota añadida
   */
  const trackNoteAdded = useCallback(async (
    email: string,
    leadId: string,
    noteType: string = 'general',
    leadType: string = 'valuation'
  ): Promise<EventResult> => {
    return trackEvent(email, 'note_added', {
      lead_id: leadId,
      note_type: noteType,
      lead_type: leadType,
    });
  }, [trackEvent]);

  /**
   * Registrar cambio de etapa en pipeline (deals/mandatos)
   */
  const trackDealStageChanged = useCallback(async (
    email: string,
    dealId: string,
    oldStage: string,
    newStage: string,
    dealValue?: number
  ): Promise<EventResult> => {
    return trackEvent(email, 'deal_stage_changed', {
      deal_id: dealId,
      old_stage: oldStage,
      new_stage: newStage,
      deal_value: dealValue,
    });
  }, [trackEvent]);

  /**
   * Registrar email respondido
   */
  const trackEmailReplied = useCallback(async (
    email: string,
    leadId: string,
    replySubject?: string,
    leadType: string = 'valuation'
  ): Promise<EventResult> => {
    return trackEvent(email, 'email_replied', {
      lead_id: leadId,
      reply_subject: replySubject,
      lead_type: leadType,
    });
  }, [trackEvent]);

  /**
   * Registrar llamada realizada
   */
  const trackCallMade = useCallback(async (
    email: string,
    leadId: string,
    callDuration?: number,
    callOutcome?: string,
    leadType: string = 'valuation'
  ): Promise<EventResult> => {
    return trackEvent(email, 'call_made', {
      lead_id: leadId,
      call_duration_seconds: callDuration,
      call_outcome: callOutcome,
      lead_type: leadType,
    });
  }, [trackEvent]);

  return {
    isTracking,
    trackEvent,
    trackLeadStatusChange,
    trackValuationCompleted,
    trackMeetingScheduled,
    trackDocumentViewed,
    trackCompanyLinked,
    trackTaskCompleted,
    trackNoteAdded,
    trackDealStageChanged,
    trackEmailReplied,
    trackCallMade,
  };
};
