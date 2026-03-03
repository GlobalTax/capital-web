import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { extractCompanyName, findBestMatch, CompanyCandidate } from '@/utils/matchPresentationToCompany';

export interface CampaignPresentation {
  id: string;
  campaign_id: string;
  company_id: string | null;
  file_name: string;
  storage_path: string;
  match_confidence: number;
  status: string;
  assigned_manually: boolean;
  created_at: string;
  updated_at: string;
}

export function useCampaignPresentations(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['campaign-presentations', campaignId];

  const { data: presentations = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('campaign_presentations' as any)
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as CampaignPresentation[];
    },
    enabled: !!campaignId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (!campaignId) throw new Error('No campaign ID');

      for (const file of files) {
        const storagePath = `${campaignId}/${file.name}`;

        // Upload to storage (upsert)
        const { error: uploadError } = await supabase.storage
          .from('campaign-presentations')
          .upload(storagePath, file, { upsert: true });

        if (uploadError) {
          toast({ title: `Error subiendo ${file.name}`, description: uploadError.message, variant: 'destructive' });
          continue;
        }

        // Check if record already exists
        const { data: existing } = await supabase
          .from('campaign_presentations' as any)
          .select('id')
          .eq('campaign_id', campaignId)
          .eq('file_name', file.name)
          .maybeSingle();

        if ((existing as any)?.id) {
          await supabase
            .from('campaign_presentations' as any)
            .update({ storage_path: storagePath, updated_at: new Date().toISOString() } as any)
            .eq('id', (existing as any).id);
        } else {
          await supabase
            .from('campaign_presentations' as any)
            .insert({
              campaign_id: campaignId,
              file_name: file.name,
              storage_path: storagePath,
              status: 'unassigned',
            } as any);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Archivos subidos correctamente' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al subir archivos', description: err.message, variant: 'destructive' });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ presentationId, companyId }: { presentationId: string; companyId: string }) => {
      const { error } = await supabase
        .from('campaign_presentations' as any)
        .update({
          company_id: companyId,
          status: 'assigned',
          assigned_manually: true,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', presentationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const autoMatchMutation = useMutation({
    mutationFn: async (companies: CompanyCandidate[]) => {
      const unassigned = presentations.filter(p => p.status === 'unassigned');
      let matched = 0;

      for (const pres of unassigned) {
        const extracted = extractCompanyName(pres.file_name);
        const result = findBestMatch(extracted, companies);

        await supabase
          .from('campaign_presentations' as any)
          .update({
            company_id: result.companyId,
            match_confidence: result.confidence,
            status: result.status,
            assigned_manually: false,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('id', pres.id);

        if (result.status === 'assigned') matched++;
      }

      return { matched, total: unassigned.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: `Asignación completada: ${result.matched}/${result.total} empresas asignadas` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (presentationId: string) => {
      const pres = presentations.find(p => p.id === presentationId);
      if (pres) {
        await supabase.storage.from('campaign-presentations').remove([pres.storage_path]);
      }
      const { error } = await supabase
        .from('campaign_presentations' as any)
        .delete()
        .eq('id', presentationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    presentations,
    isLoading,
    uploadFiles: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    assignCompany: assignMutation.mutateAsync,
    autoMatch: autoMatchMutation.mutateAsync,
    isMatching: autoMatchMutation.isPending,
    deletePresentation: deleteMutation.mutateAsync,
  };
}
