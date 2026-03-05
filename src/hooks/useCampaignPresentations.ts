import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { extractCompanyName, findBestMatch, CompanyCandidate } from '@/utils/matchPresentationToCompany';
import { buildCampaignPresentationPath, normalizeCampaignPresentationPath } from '@/utils/campaignPresentationStorage';

export interface CampaignPresentation {
  id: string;
  campaign_id: string;
  company_id: string | null;
  file_name: string;
  storage_path: string;
  match_confidence: number | null;
  status: string;
  assigned_manually: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UploadProgress {
  current: number;
  total: number;
  currentFile: string;
}

export interface UploadResult {
  success: number;
  errors: { file: string; reason: string }[];
}

export function useCampaignPresentations(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['campaign-presentations', campaignId];
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [matchProgress, setMatchProgress] = useState<UploadProgress | null>(null);

  const { data: presentations = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from('campaign_presentations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as CampaignPresentation[];
    },
    enabled: !!campaignId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadResult> => {
      if (!campaignId) throw new Error('No campaign ID');

      const result: UploadResult = { success: 0, errors: [] };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length, currentFile: file.name });
        console.log(`[SUBIDA] Iniciando: ${file.name}`);

        try {
          const storagePath = buildCampaignPresentationPath(campaignId, file.name);

          // Upload to storage (upsert)
          const { error: uploadError } = await supabase.storage
            .from('campaign-presentations')
            .upload(storagePath, file, {
              upsert: true,
              contentType: 'application/pdf',
            });

          if (uploadError) {
            console.error('[ERROR STORAGE]', uploadError);
            result.errors.push({ file: file.name, reason: `Error Storage: ${uploadError.message}` });
            continue;
          }
          console.log(`[STORAGE] OK: ${storagePath}`);

          // Check if record already exists
          const { data: existing } = await supabase
            .from('campaign_presentations')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('file_name', file.name)
            .maybeSingle();

          if (existing?.id) {
            // Update existing
            const { error: updateError } = await supabase
              .from('campaign_presentations')
              .update({ storage_path: storagePath, updated_at: new Date().toISOString() })
              .eq('id', existing.id);

            if (updateError) {
              console.error('[ERROR BD]', updateError);
              result.errors.push({ file: file.name, reason: `Error BD: ${updateError.message}` });
              continue;
            }
            console.log('[BD] OK:', existing.id);
          } else {
            // Insert new
            const { data: inserted, error: insertError } = await supabase
              .from('campaign_presentations')
              .insert({
                campaign_id: campaignId,
                file_name: file.name,
                storage_path: storagePath,
                status: 'unassigned',
              })
              .select('id')
              .single();

            if (insertError) {
              console.error('[ERROR BD]', insertError);
              // Retry once
              console.log(`Reintentando insert para ${file.name}...`);
              const { data: retryData, error: retryError } = await supabase
                .from('campaign_presentations')
                .insert({
                  campaign_id: campaignId,
                  file_name: file.name,
                  storage_path: storagePath,
                  status: 'unassigned',
                })
                .select('id')
                .single();

              if (retryError) {
                console.error('[ERROR BD]', retryError);
                result.errors.push({ file: file.name, reason: `Archivo subido pero no registrado en BD: ${retryError.message}` });
                continue;
              }
              console.log('[BD] OK:', retryData.id);
            } else {
              console.log('[BD] OK:', inserted.id);
            }
          }

          result.success++;
          // Invalidate after each file for real-time updates
          queryClient.invalidateQueries({ queryKey });
        } catch (err: any) {
          console.error(`ERROR archivo ${file.name}: ${err.message}`);
          result.errors.push({ file: file.name, reason: err.message });
        }
      }

      return result;
    },
    onSuccess: (result) => {
      setUploadProgress(null);
      queryClient.invalidateQueries({ queryKey });
      const errorMsg = result.errors.length > 0
        ? `\n${result.errors.map(e => `• ${e.file}: ${e.reason}`).join('\n')}`
        : '';
      toast({
        title: `${result.success} archivos subidos correctamente. ${result.errors.length} errores.`,
        description: errorMsg || undefined,
        variant: result.errors.length > 0 ? 'destructive' : 'default',
      });
    },
    onError: (err: any) => {
      setUploadProgress(null);
      toast({ title: 'Error al subir archivos', description: err.message, variant: 'destructive' });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ presentationId, companyId }: { presentationId: string; companyId: string }) => {
      const { error } = await supabase
        .from('campaign_presentations')
        .update({
          company_id: companyId,
          status: 'assigned',
          assigned_manually: true,
          match_confidence: 1.0,
          updated_at: new Date().toISOString(),
        })
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

      // Prepare a slim company list for the AI
      const companyList = companies.map(c => ({ id: c.id, name: (c as any).company_name || (c as any).name || '', cif: (c as any).cif || '' }));

      for (let i = 0; i < unassigned.length; i++) {
        const pres = unassigned[i];
        setMatchProgress({ current: i + 1, total: unassigned.length, currentFile: pres.file_name });

        const extracted = extractCompanyName(pres.file_name);
        let result: { companyId: string | null; confidence: number; status: string };

        try {
          // Try AI matching via edge function
          const { data: aiResult, error: fnError } = await supabase.functions.invoke('match-presentations', {
            body: { extractedName: extracted, companies: companyList },
          });

          if (fnError || !aiResult || aiResult.error) {
            console.warn(`AI match failed for ${pres.file_name}, falling back to local`, fnError?.message || aiResult?.error);
            result = findBestMatch(extracted, companies);
          } else {
            const confidence = aiResult.confidence ?? 0;
            result = {
              companyId: confidence >= 0.75 ? aiResult.company_id : null,
              confidence,
              status: confidence >= 0.75 ? 'assigned' : 'unassigned',
            };
          }
        } catch (err: any) {
          console.warn(`AI match exception for ${pres.file_name}, falling back to local`, err.message);
          result = findBestMatch(extracted, companies);
        }

        const { error } = await supabase
          .from('campaign_presentations')
          .update({
            company_id: result.companyId,
            match_confidence: result.confidence,
            status: result.status,
            assigned_manually: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pres.id);

        if (error) {
          console.error(`ERROR matching ${pres.file_name}: ${error.message}`);
        }

        if (result.status === 'assigned') matched++;
      }

      return { matched, total: unassigned.length };
    },
    onSuccess: (result) => {
      setMatchProgress(null);
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: `${result.matched} archivos asignados automáticamente. ${result.total - result.matched} requieren asignación manual.`,
      });
    },
    onSettled: () => {
      setMatchProgress(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (presentationId: string) => {
      const pres = presentations.find(p => p.id === presentationId);
      if (pres) {
        const normalizedPath = normalizeCampaignPresentationPath(pres.storage_path);
        await supabase.storage.from('campaign-presentations').remove([normalizedPath]);
      }
      const { error } = await supabase
        .from('campaign_presentations')
        .delete()
        .eq('id', presentationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Archivo eliminado' });
    },
  });

  return {
    presentations,
    isLoading,
    uploadFiles: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    assignCompany: assignMutation.mutateAsync,
    autoMatch: autoMatchMutation.mutateAsync,
    isMatching: autoMatchMutation.isPending,
    matchProgress,
    deletePresentation: deleteMutation.mutateAsync,
  };
}
