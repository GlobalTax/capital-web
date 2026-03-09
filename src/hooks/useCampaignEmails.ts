import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { replaceVariables } from '@/utils/campaignEmailTemplateEngine';

const QUERY_KEY = 'campaign-emails';

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const e = error as any;
    return e.message || e.error_description || e.details || fallback;
  }
  return fallback;
};

export interface CampaignEmail {
  id: string;
  campaign_id: string;
  company_id: string;
  subject: string;
  body: string;
  is_manually_edited: boolean;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  email_message_id: string | null;
  email_opened: boolean;
  email_opened_at: string | null;
  delivery_status: string | null;
}

export function useCampaignEmails(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, campaignId];

  const { data: emails = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('campaign_emails')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as CampaignEmail[];
    },
    enabled: !!campaignId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const saveTemplateMutation = useMutation({
    mutationFn: async ({ subject, body }: { subject: string; body: string }) => {
      if (!campaignId) throw new Error('No campaign');
      const { error } = await (supabase as any)
        .from('valuation_campaigns')
        .update({
          email_subject_template: subject,
          email_body_template: body,
        })
        .eq('id', campaignId);
      if (error) throw error;
    },
  });

  const generateEmailsMutation = useMutation({
    mutationFn: async ({
      subjectTemplate,
      bodyTemplate,
      companies,
      campaign,
      overwriteManual,
    }: {
      subjectTemplate: string;
      bodyTemplate: string;
      companies: CampaignCompany[];
      campaign: ValuationCampaign;
      overwriteManual: boolean;
    }) => {
      if (!campaignId) throw new Error('No campaign');

      const existingMap = new Map(emails.map(e => [e.company_id, e]));
      const companyIdsSeen = new Set<string>();

      const updates: { id: string; data: Record<string, any> }[] = [];
      const inserts: Record<string, any>[] = [];

      for (const company of companies) {
        const companyId = company?.id;
        if (!companyId || companyIdsSeen.has(companyId)) continue;
        companyIdsSeen.add(companyId);

        const existing = existingMap.get(companyId);
        if (existing?.is_manually_edited && !overwriteManual) continue;

        const subject = replaceVariables(subjectTemplate, company, campaign);
        const body = replaceVariables(bodyTemplate, company, campaign);
        const updated_at = new Date().toISOString();

        if (existing?.id) {
          updates.push({
            id: existing.id,
            data: {
              subject,
              body,
              is_manually_edited: false,
              status: existing.status === 'sent' ? 'sent' : 'pending',
              sent_at: existing.sent_at || null,
              updated_at,
            },
          });
        } else {
          inserts.push({
            campaign_id: campaignId,
            company_id: companyId,
            subject,
            body,
            is_manually_edited: false,
            status: 'pending',
            sent_at: null,
            updated_at,
          });
        }
      }

      const total = updates.length + inserts.length;
      if (total === 0) return 0;

      const batchSize = 50;

      if (updates.length > 0) {
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          const updateResults = await Promise.all(
            batch.map((item) =>
              (supabase as any)
                .from('campaign_emails')
                .update(item.data)
                .eq('id', item.id)
            )
          );

          const updateError = updateResults.find(r => r.error)?.error;
          if (updateError) throw updateError;
        }
      }

      if (inserts.length > 0) {
        for (let i = 0; i < inserts.length; i += batchSize) {
          const batch = inserts.slice(i, i + batchSize);
          const { error } = await (supabase as any)
            .from('campaign_emails')
            .insert(batch);
          if (error) throw error;
        }
      }

      return total;
    },
    onSuccess: (count) => {
      invalidate();
      if (count) toast.success(`${count} emails generados correctamente`);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al generar emails')),
  });

  const updateEmailMutation = useMutation({
    mutationFn: async ({ id, subject, body }: { id: string; subject: string; body: string }) => {
      const { error } = await (supabase as any)
        .from('campaign_emails')
        .update({ subject, body, is_manually_edited: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Email actualizado');
    },
    onError: () => toast.error('Error al actualizar email'),
  });

  const restoreTemplateMutation = useMutation({
    mutationFn: async ({
      emailId,
      company,
      campaign,
      subjectTemplate,
      bodyTemplate,
    }: {
      emailId: string;
      company: CampaignCompany;
      campaign: ValuationCampaign;
      subjectTemplate: string;
      bodyTemplate: string;
    }) => {
      const subject = replaceVariables(subjectTemplate, company, campaign);
      const body = replaceVariables(bodyTemplate, company, campaign);
      const { error } = await (supabase as any)
        .from('campaign_emails')
        .update({ subject, body, is_manually_edited: false, updated_at: new Date().toISOString() })
        .eq('id', emailId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Email restaurado desde template');
    },
    onError: () => toast.error('Error al restaurar email'),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      const { data, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
        body: { email_ids: [emailId] },
      });
      if (error) throw error;
      if (data?.failed > 0) {
        const failedResult = data.results?.find((r: any) => r.status === 'error');
        throw new Error(failedResult?.error || 'Error al enviar email');
      }
    },
    onSuccess: () => {
      invalidate();
      toast.success('Email enviado correctamente');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al enviar email')),
  });

  const sendAllPendingMutation = useMutation({
    mutationFn: async () => {
      const pending = emails.filter(e => e.status === 'pending');
      if (pending.length === 0) return { sent: 0, failed: 0 };
      const ids = pending.map(e => e.id);
      const { data, error } = await supabase.functions.invoke('send-campaign-outbound-email', {
        body: { email_ids: ids },
      });
      if (error) throw error;
      return { sent: data?.sent || 0, failed: data?.failed || 0 };
    },
    onSuccess: (result) => {
      invalidate();
      if (result.sent > 0) toast.success(`${result.sent} emails enviados correctamente`);
      if (result.failed > 0) toast.error(`${result.failed} emails fallaron al enviar`);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Error al enviar emails')),
  });

  return {
    emails,
    isLoading,
    saveTemplate: saveTemplateMutation.mutateAsync,
    generateEmails: generateEmailsMutation.mutateAsync,
    isGenerating: generateEmailsMutation.isPending,
    updateEmail: updateEmailMutation.mutateAsync,
    restoreTemplate: restoreTemplateMutation.mutateAsync,
    sendEmail: sendEmailMutation.mutateAsync,
    sendAllPending: sendAllPendingMutation.mutateAsync,
    isSendingAll: sendAllPendingMutation.isPending,
    invalidate,
  };
}
