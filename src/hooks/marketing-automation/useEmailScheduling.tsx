
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmailScheduling = () => {
  // Programar envío de email
  const scheduleEmail = useCallback(async ({
    leadScoreId,
    sequenceId,
    stepId,
    recipientEmail,
    scheduledFor
  }: {
    leadScoreId: string;
    sequenceId: string;
    stepId: string;
    recipientEmail: string;
    scheduledFor: string;
  }) => {
    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert({
        lead_score_id: leadScoreId,
        sequence_id: sequenceId,
        step_id: stepId,
        recipient_email: recipientEmail,
        scheduled_for: scheduledFor
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, []);

  return {
    scheduleEmail,
  };
};
