import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { buildCampaignPresentationPath, normalizeCampaignPresentationPath } from '@/utils/campaignPresentationStorage';

const QUERY_KEY = 'valuation-campaigns';

export interface ValuationCampaign {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  sector: string;
  status: string;
  custom_multiple: number | null;
  multiple_low: number | null;
  multiple_high: number | null;
  valuation_context: string | null;
  strengths_template: string | null;
  weaknesses_template: string | null;
  comparables_text: string | null;
  include_comparables: boolean;
  ai_personalize: boolean;
  advisor_name: string | null;
  advisor_email: string | null;
  advisor_phone: string | null;
  advisor_role: string | null;
  use_custom_advisor: boolean;
  lead_source: string;
  service_type: string;
  valuation_type: 'ebitda_multiple' | 'revenue_multiple';
  campaign_type: 'valuation' | 'document';
  financial_years: number[] | null;
  years_mode: string;
  total_companies: number;
  total_created: number;
  total_sent: number;
  total_errors: number;
  total_valuation: number;
}

export type CampaignInsert = Omit<ValuationCampaign, 'id' | 'created_at' | 'updated_at' | 'total_companies' | 'total_created' | 'total_sent' | 'total_errors' | 'total_valuation'>;

export function useCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ValuationCampaign[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (campaign: Partial<CampaignInsert>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .insert([{ ...campaign, created_by: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña creada');
    },
    onError: (e: Error) => toast.error('Error al crear campaña: ' + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<ValuationCampaign> }) => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e: Error) => toast.error('Error al actualizar campaña: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('valuation_campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña eliminada');
    },
    onError: (e: Error) => toast.error('Error al eliminar campaña: ' + e.message),
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ id, asType }: { id: string; asType?: 'valuation' | 'document' }) => {
      const { data: original, error: fetchError } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();

      const { id: _id, created_at, updated_at, total_companies, total_created, total_sent, total_errors, total_valuation, ...config } = original;

      const targetType = asType || original.campaign_type || 'valuation';
      const suffix = asType && asType !== original.campaign_type ? ` (${asType === 'document' ? 'documento' : 'valoración'})` : ' (copia)';

      const { data: newCampaign, error } = await (supabase as any)
        .from('valuation_campaigns')
        .insert([{
          ...config,
          name: `${original.name}${suffix}`,
          status: 'draft',
          campaign_type: targetType,
          created_by: user?.id,
          total_companies: 0,
          total_created: 0,
          total_sent: 0,
          total_errors: 0,
          total_valuation: 0,
        }])
        .select()
        .single();
      if (error) throw error;

      // Copy companies with reset states
      const { data: companies, error: companiesError } = await (supabase as any)
        .from('valuation_campaign_companies')
        .select('*')
        .eq('campaign_id', id);
      if (companiesError) throw companiesError;

      if (companies && companies.length > 0) {
        const clonedCompanies = companies.map((c: any) => ({
          campaign_id: newCampaign.id,
          // Preserve all company & financial data
          client_company: c.client_company,
          client_name: c.client_name,
          client_email: c.client_email,
          client_phone: c.client_phone,
          client_cif: c.client_cif,
          client_website: c.client_website,
          client_provincia: c.client_provincia,
          ebitda: c.ebitda,
          revenue: c.revenue,
          financial_year: c.financial_year,
          financial_years_data: c.financial_years_data,
          excel_row_number: c.excel_row_number,
          source: c.source,
          custom_multiple: c.custom_multiple,
          normalized_ebitda: c.normalized_ebitda,
          // Preserve AI enrichment
          ai_strengths: c.ai_strengths,
          ai_weaknesses: c.ai_weaknesses,
          ai_context: c.ai_context,
          ai_enriched: c.ai_enriched,
          // Preserve valuation results & PDF
          valuation_low: c.valuation_low,
          valuation_central: c.valuation_central,
          valuation_high: c.valuation_high,
          multiple_used: c.multiple_used,
          range_label: c.range_label,
          pdf_url: c.pdf_url,
          // Reset operational/send status fields only
          status: 'pending',
          error_message: null,
          follow_up_status: null,
          follow_up_count: 0,
          followup_enviado: false,
          followup_sent_at: null,
          seguimiento_estado: null,
          seguimiento_notas: null,
          is_auto_assigned: false,
          last_interaction_at: null,
          professional_valuation_id: null,
        }));

        const { error: insertError } = await (supabase as any)
          .from('valuation_campaign_companies')
          .insert(clonedCompanies);
        if (insertError) throw insertError;

        // Update total_companies counter
        await (supabase as any)
          .from('valuation_campaigns')
          .update({ total_companies: companies.length })
          .eq('id', newCampaign.id);
      }

      // ── Build old→new company ID map (shared by presentations, emails, etc.) ──
      const companyIdMap = new Map<string, string>();
      {
        const { data: origCompanies } = await (supabase as any)
          .from('valuation_campaign_companies')
          .select('id, client_company, client_cif')
          .eq('campaign_id', id);
        const { data: newCompanies } = await (supabase as any)
          .from('valuation_campaign_companies')
          .select('id, client_company, client_cif')
          .eq('campaign_id', newCampaign.id);
        if (origCompanies && newCompanies) {
          for (const oldComp of origCompanies) {
            const match = newCompanies.find((nc: any) =>
              (oldComp.client_cif && nc.client_cif && oldComp.client_cif === nc.client_cif) ||
              oldComp.client_company === nc.client_company
            );
            if (match) companyIdMap.set(oldComp.id, match.id);
          }
        }
      }

      // Copy presentations only for valuation campaigns (document campaigns start fresh)
      if (targetType !== 'document') {
      const { data: presentations, error: presError } = await supabase
        .from('campaign_presentations')
        .select('*')
        .eq('campaign_id', id);

      if (!presError && presentations && presentations.length > 0) {
        for (const pres of presentations) {
          try {
            const originalPath = normalizeCampaignPresentationPath(pres.storage_path || '');
            const newStoragePath = buildCampaignPresentationPath(newCampaign.id, pres.file_name);

            if (originalPath) {
              const copyRes = await supabase.functions.invoke('upload-campaign-presentation', {
                body: { action: 'copy', path: originalPath, destinationPath: newStoragePath },
              });
              if (copyRes.error) {
                console.warn(`[duplicateCampaign] Failed to copy file ${pres.file_name}:`, copyRes.error);
              }
            }

            const newCompanyId = pres.company_id ? (companyIdMap.get(pres.company_id) || null) : null;

            await supabase
              .from('campaign_presentations')
              .insert({
                campaign_id: newCampaign.id,
                company_id: newCompanyId,
                file_name: pres.file_name,
                storage_path: newStoragePath,
                match_confidence: pres.match_confidence,
                status: pres.company_id && newCompanyId ? pres.status : 'unassigned',
                assigned_manually: pres.assigned_manually,
              });
          } catch (copyErr) {
            console.warn(`[duplicateCampaign] Error copying presentation ${pres.file_name}:`, copyErr);
          }
        }
      }
      } // end: skip presentations for document campaigns

      // ── Copy campaign_emails (clean: keep content, reset operational state) ──
      const { data: originalEmails, error: emailsFetchErr } = await (supabase as any)
        .from('campaign_emails')
        .select('*')
        .eq('campaign_id', id);

      if (!emailsFetchErr && originalEmails && originalEmails.length > 0) {
        const cleanEmails = originalEmails
          .map((email: any) => {
            const newCompanyId = email.company_id ? companyIdMap.get(email.company_id) : null;
            if (email.company_id && !newCompanyId) return null; // skip unmapped
            return {
              campaign_id: newCampaign.id,
              company_id: newCompanyId,
              subject: email.subject,
              body: email.body,
              is_manually_edited: email.is_manually_edited || false,
              // Reset all operational fields
              status: 'pending',
              sent_at: null,
              error_message: null,
              email_message_id: null,
              email_opened: false,
              email_opened_at: null,
              delivery_status: null,
            };
          })
          .filter(Boolean);

        if (cleanEmails.length > 0) {
          const { error: emailsInsertErr } = await (supabase as any)
            .from('campaign_emails')
            .insert(cleanEmails);
          if (emailsInsertErr) {
            console.warn('[duplicateCampaign] Error copying emails:', emailsInsertErr);
          }
        }
      }

      // ── Copy campaign_followup_sequences (templates only, no sends) ──
      const { data: originalSequences, error: seqFetchErr } = await (supabase as any)
        .from('campaign_followup_sequences')
        .select('*')
        .eq('campaign_id', id)
        .order('sequence_number', { ascending: true });

      if (!seqFetchErr && originalSequences && originalSequences.length > 0) {
        const cleanSequences = originalSequences.map((seq: any) => ({
          campaign_id: newCampaign.id,
          sequence_number: seq.sequence_number,
          label: seq.label,
          subject: seq.subject,
          body_html: seq.body_html,
        }));

        const { error: seqInsertErr } = await (supabase as any)
          .from('campaign_followup_sequences')
          .insert(cleanSequences);
        if (seqInsertErr) {
          console.warn('[duplicateCampaign] Error copying followup sequences:', seqInsertErr);
        }
      }

      return newCampaign as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña duplicada con todo su contenido');
    },
    onError: (e: Error) => toast.error('Error al duplicar campaña: ' + e.message),
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    refetch,
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    duplicateCampaign: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    enabled: !!id,
  });
}
