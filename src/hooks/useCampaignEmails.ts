import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CampaignCompany } from '@/hooks/useCampaignCompanies';
import { ValuationCampaign } from '@/hooks/useCampaigns';
import { replaceVariables } from '@/utils/campaignEmailTemplateEngine';

const QUERY_KEY = 'campaign-emails';

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
      const upserts: any[] = [];

      for (const company of companies) {
        const existing = existingMap.get(company.id);
        if (existing?.is_manually_edited && !overwriteManual) continue;

        upserts.push({
          id: existing?.id || undefined,
          campaign_id: campaignId,
          company_id: company.id,
          subject: replaceVariables(subjectTemplate, company, campaign),
          body: replaceVariables(bodyTemplate, company, campaign),
          is_manually_edited: false,
          status: existing?.status === 'sent' ? 'sent' : 'pending',
          sent_at: existing?.sent_at || null,
          updated_at: new Date().toISOString(),
        });
      }

      if (upserts.length === 0) return 0;

      const { error } = await (supabase as any)
        .from('campaign_emails')
        .upsert(upserts, { onConflict: 'id' });
      if (error) throw error;
      return upserts.length;
    },
    onSuccess: (count) => {
      invalidate();
      if (count) toast.success(`${count} emails generados correctamente`);
    },
    onError: () => toast.error('Error al generar emails'),
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
      // For now, just mark as sent. Real delivery via edge function later.
      const { error } = await (supabase as any)
        .from('campaign_emails')
        .update({ status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', emailId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Email marcado como enviado');
    },
    onError: () => toast.error('Error al enviar email'),
  });

  const sendAllPendingMutation = useMutation({
    mutationFn: async () => {
      const pending = emails.filter(e => e.status === 'pending');
      if (pending.length === 0) return 0;
      const now = new Date().toISOString();
      const { error } = await (supabase as any)
        .from('campaign_emails')
        .update({ status: 'sent', sent_at: now, updated_at: now })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending');
      if (error) throw error;
      return pending.length;
    },
    onSuccess: (count) => {
      invalidate();
      if (count) toast.success(`${count} emails enviados`);
    },
    onError: () => toast.error('Error al enviar emails'),
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
