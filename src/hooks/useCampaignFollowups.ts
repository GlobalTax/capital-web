import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { replaceVariables } from '@/utils/campaignEmailTemplateEngine';

const QUERY_KEY = 'campaign-followups';

export interface CampaignFollowup {
  id: string;
  campaign_id: string;
  company_id: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  is_manually_edited: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Replace followup-specific variables including {{dias_desde_envio}}
 */
function replaceFollowupVariables(
  template: string,
  company: CampaignCompany,
  campaign: ValuationCampaign,
  emailSentAt: string | null
): string {
  // First apply standard variables
  let result = replaceVariables(template, company, campaign);

  // Then replace {{dias_desde_envio}}
  let dias = 'varios';
  if (emailSentAt) {
    const sentDate = new Date(emailSentAt);
    const now = new Date();
    const diffMs = now.getTime() - sentDate.getTime();
    dias = String(Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24))));
  }
  result = result.replace(/\{\{dias_desde_envio\}\}/g, dias);

  return result;
}

export function useCampaignFollowups(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, campaignId];

  const { data: followups = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('campaign_followups')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as CampaignFollowup[];
    },
    enabled: !!campaignId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies', campaignId] });
  };

  // Save followup template to campaign
  const saveTemplateMutation = useMutation({
    mutationFn: async ({ subject, body }: { subject: string; body: string }) => {
      if (!campaignId) throw new Error('No campaign');
      const { error } = await (supabase as any)
        .from('valuation_campaigns')
        .update({
          followup_subject_template: subject,
          followup_body_template: body,
        })
        .eq('id', campaignId);
      if (error) throw error;
    },
  });

  // Generate followup records for eligible companies
  const generateFollowupsMutation = useMutation({
    mutationFn: async ({
      subjectTemplate,
      bodyTemplate,
      companies,
      campaign,
      emails,
    }: {
      subjectTemplate: string;
      bodyTemplate: string;
      companies: CampaignCompany[];
      campaign: ValuationCampaign;
      emails: { company_id: string; sent_at: string | null }[];
    }) => {
      if (!campaignId) throw new Error('No campaign');

      const emailMap = new Map(emails.map(e => [e.company_id, e.sent_at]));

      // Filter eligible companies
      const eligible = companies.filter(c => {
        const estado = c.seguimiento_estado || 'sin_respuesta';
        // Only sin_respuesta gets follow up
        if (estado !== 'sin_respuesta') return false;
        // Skip if already sent followup
        if ((c as any).followup_enviado) return false;
        return true;
      });

      if (eligible.length === 0) return 0;

      // Check existing followups to avoid duplicates
      const existingMap = new Map(followups.map(f => [f.company_id, f]));
      const companyIdsSeen = new Set<string>();
      const inserts: Record<string, any>[] = [];
      const updates: { id: string; data: Record<string, any> }[] = [];

      for (const company of eligible) {
        if (!company.id || companyIdsSeen.has(company.id)) continue;
        companyIdsSeen.add(company.id);

        const emailSentAt = emailMap.get(company.id) || null;
        const subject = replaceFollowupVariables(subjectTemplate, company, campaign, emailSentAt);
        const body = replaceFollowupVariables(bodyTemplate, company, campaign, emailSentAt);
        const existing = existingMap.get(company.id);

        if (existing) {
          updates.push({
            id: existing.id,
            data: { subject, body, status: existing.status === 'sent' ? 'sent' : 'pending', updated_at: new Date().toISOString() },
          });
        } else {
          inserts.push({
            campaign_id: campaignId,
            company_id: company.id,
            subject,
            body,
            status: 'pending',
          });
        }
      }

      const batchSize = 50;

      if (updates.length > 0) {
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          await Promise.all(
            batch.map(item =>
              (supabase as any).from('campaign_followups').update(item.data).eq('id', item.id)
            )
          );
        }
      }

      if (inserts.length > 0) {
        for (let i = 0; i < inserts.length; i += batchSize) {
          const batch = inserts.slice(i, i + batchSize);
          const { error } = await (supabase as any).from('campaign_followups').insert(batch);
          if (error) throw error;
        }
      }

      return inserts.length + updates.length;
    },
    onSuccess: (count) => {
      invalidate();
      if (count) toast.success(`${count} follow ups generados correctamente`);
    },
    onError: (error: any) => toast.error(error?.message || 'Error al generar follow ups'),
  });

  // Send a single followup via edge function
  const sendFollowupMutation = useMutation({
    mutationFn: async (followupId: string) => {
      const followup = followups.find(f => f.id === followupId);
      if (!followup) throw new Error('Follow up no encontrado');

      const { data, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
        body: {
          followup_ids: [followupId],
          is_followup: true,
        },
      });
      if (error) throw error;
      if (data?.failed > 0) {
        const failedResult = data.results?.find((r: any) => r.status === 'error');
        throw new Error(failedResult?.error || 'Error al enviar follow up');
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success('Follow up enviado');
    },
    onError: (error: any) => toast.error(error?.message || 'Error al enviar follow up'),
  });

  // Send all pending followups
  const sendAllPendingMutation = useMutation({
    mutationFn: async (onProgress?: (sent: number, total: number) => void) => {
      const pending = followups.filter(f => f.status === 'pending');
      if (pending.length === 0) return { sent: 0, failed: 0 };

      let sentCount = 0;
      let failedCount = 0;

      for (const followup of pending) {
        try {
          const { data, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
            body: {
              followup_ids: [followup.id],
              is_followup: true,
            },
          });

          if (error) throw error;
          if (data?.failed > 0) throw new Error('Send failed');

          sentCount++;
        } catch (err: any) {
          failedCount++;
        }
        onProgress?.(sentCount + failedCount, pending.length);
      }

      return { sent: sentCount, failed: failedCount };
    },
    onSuccess: (result) => {
      invalidate();
      if (result.sent > 0) toast.success(`${result.sent} follow ups enviados`);
      if (result.failed > 0) toast.error(`${result.failed} follow ups fallaron`);
    },
    onError: (error: any) => toast.error(error?.message || 'Error al enviar follow ups'),
  });

  return {
    followups,
    isLoading,
    saveTemplate: saveTemplateMutation.mutateAsync,
    generateFollowups: generateFollowupsMutation.mutateAsync,
    isGenerating: generateFollowupsMutation.isPending,
    sendFollowup: sendFollowupMutation.mutateAsync,
    sendAllPending: sendAllPendingMutation.mutateAsync,
    isSendingAll: sendAllPendingMutation.isPending,
    invalidate,
    replaceFollowupVariables,
  };
}
