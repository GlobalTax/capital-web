import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { replaceVariables } from '@/utils/campaignEmailTemplateEngine';

// ─── Types ──────────────────────────────────────────────────────────────

export interface FollowupSequence {
  id: string;
  campaign_id: string;
  sequence_number: number;
  label: string;
  subject: string;
  body_html: string;
  created_at: string;
  updated_at: string;
}

export interface FollowupSend {
  id: string;
  sequence_id: string;
  campaign_id: string;
  company_id: string;
  to_email: string;
  subject_resolved: string;
  body_resolved: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  seguimiento_estado: string | null;
  email_message_id: string | null;
  email_opened: boolean;
  email_opened_at: string | null;
  delivery_status: string | null;
}

// ─── Variable resolution ────────────────────────────────────────────────

function resolveFollowupVariables(
  template: string,
  company: CampaignCompany,
  campaign: ValuationCampaign,
  emailSentAt: string | null,
  sequenceNumber: number
): string {
  let result = replaceVariables(template, company, campaign);

  // {{dias_desde_primer_envio}}
  let dias = 'varios';
  if (emailSentAt) {
    const diffMs = Date.now() - new Date(emailSentAt).getTime();
    dias = String(Math.max(1, Math.floor(diffMs / 86400000)));
  }
  result = result.replace(/\{\{dias_desde_primer_envio\}\}/g, dias);

  // {{numero_followup}}
  result = result.replace(/\{\{numero_followup\}\}/g, String(sequenceNumber));

  return result;
}

// ─── Hook ───────────────────────────────────────────────────────────────

const SEQ_KEY = 'followup-sequences';
const SEND_KEY = 'followup-sends';

export function useFollowupSequences(campaignId: string | undefined) {
  const qc = useQueryClient();

  // ── Sequences ─────────────────────────────────────────────────────────
  const { data: sequences = [], isLoading: loadingSeqs } = useQuery({
    queryKey: [SEQ_KEY, campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('campaign_followup_sequences')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('sequence_number', { ascending: true });
      if (error) throw error;
      return (data || []) as FollowupSequence[];
    },
    enabled: !!campaignId,
  });

  // ── All sends for this campaign ───────────────────────────────────────
  const { data: allSends = [], isLoading: loadingSends } = useQuery({
    queryKey: [SEND_KEY, campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('campaign_followup_sends')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as FollowupSend[];
    },
    enabled: !!campaignId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [SEQ_KEY, campaignId] });
    qc.invalidateQueries({ queryKey: [SEND_KEY, campaignId] });
  };

  // ── Add new sequence ──────────────────────────────────────────────────
  const addSequence = useMutation({
    mutationFn: async () => {
      if (!campaignId) throw new Error('No campaign');
      const nextNum = sequences.length > 0
        ? Math.max(...sequences.map(s => s.sequence_number)) + 1
        : 1;
      const label = `Follow up ${nextNum}`;
      const { data, error } = await (supabase as any)
        .from('campaign_followup_sequences')
        .insert({
          campaign_id: campaignId,
          sequence_number: nextNum,
          label,
          subject: 'Seguimiento — {{company}}',
          body_html: '',
        })
        .select()
        .single();
      if (error) throw error;
      return data as FollowupSequence;
    },
    onSuccess: () => { invalidate(); toast.success('Nueva ronda creada'); },
    onError: (e: any) => toast.error(e?.message || 'Error al crear ronda'),
  });

  // ── Update sequence template ──────────────────────────────────────────
  const updateSequence = useMutation({
    mutationFn: async ({ id, label, subject, body_html }: { id: string; label?: string; subject?: string; body_html?: string }) => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (label !== undefined) updates.label = label;
      if (subject !== undefined) updates.subject = subject;
      if (body_html !== undefined) updates.body_html = body_html;
      const { error } = await (supabase as any)
        .from('campaign_followup_sequences')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); },
    onError: (e: any) => toast.error(e?.message || 'Error al actualizar'),
  });

  // ── Delete sequence (only if no sent sends) ───────────────────────────
  const deleteSequence = useMutation({
    mutationFn: async (seqId: string) => {
      const hasSent = allSends.some(s => s.sequence_id === seqId && s.status === 'sent');
      if (hasSent) throw new Error('No se puede eliminar una ronda con envíos realizados');
      const { error } = await (supabase as any)
        .from('campaign_followup_sequences')
        .delete()
        .eq('id', seqId);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success('Ronda eliminada'); },
    onError: (e: any) => toast.error(e?.message || 'Error al eliminar'),
  });

  // ── Send a single follow-up for one company in one round ──────────────
  const sendOne = useMutation({
    mutationFn: async ({
      sequence,
      company,
      campaign,
      emailSentAt,
    }: {
      sequence: FollowupSequence;
      company: CampaignCompany;
      campaign: ValuationCampaign;
      emailSentAt: string | null;
    }) => {
      if (!campaignId) throw new Error('No campaign');

      const subjectResolved = resolveFollowupVariables(
        sequence.subject, company, campaign, emailSentAt, sequence.sequence_number
      );
      const bodyResolved = resolveFollowupVariables(
        sequence.body_html, company, campaign, emailSentAt, sequence.sequence_number
      );

      // Check if send record exists already
      const existing = allSends.find(
        s => s.sequence_id === sequence.id && s.company_id === company.id
      );

      let sendId: string;

      if (existing) {
        if (existing.status === 'sent') throw new Error('Ya enviado');
        // Update existing record
        await (supabase as any)
          .from('campaign_followup_sends')
          .update({ subject_resolved: subjectResolved, body_resolved: bodyResolved, status: 'pending' })
          .eq('id', existing.id);
        sendId = existing.id;
      } else {
        // Insert new
        const { data, error } = await (supabase as any)
          .from('campaign_followup_sends')
          .insert({
            sequence_id: sequence.id,
            campaign_id: campaignId,
            company_id: company.id,
            to_email: company.client_email || '',
            subject_resolved: subjectResolved,
            body_resolved: bodyResolved,
            status: 'pending',
          })
          .select('id')
          .single();
        if (error) throw error;
        sendId = data.id;
      }

      // Call Edge Function
      const { data: result, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
        body: { followup_send_ids: [sendId], is_followup_send: true },
      });
      if (error) throw error;
      if (result?.failed > 0) {
        const failedResult = result.results?.find((r: any) => r.status === 'error');
        throw new Error(failedResult?.error || 'Error al enviar');
      }
    },
    onSuccess: () => { invalidate(); toast.success('Follow up enviado'); },
    onError: (e: any) => toast.error(e?.message || 'Error al enviar'),
  });

  return {
    sequences,
    allSends,
    loadingSeqs,
    loadingSends,
    addSequence: addSequence.mutateAsync,
    isAdding: addSequence.isPending,
    updateSequence: updateSequence.mutateAsync,
    deleteSequence: deleteSequence.mutateAsync,
    sendOne: sendOne.mutateAsync,
    isSendingOne: sendOne.isPending,
    invalidate,
    resolveFollowupVariables,
  };
}
