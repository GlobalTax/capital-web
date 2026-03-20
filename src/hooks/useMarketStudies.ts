import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MarketStudy {
  id: string;
  title: string;
  sector: string | null;
  description: string | null;
  file_name: string;
  storage_path: string;
  file_size: number;
  uploaded_by: string | null;
  status: 'pending' | 'validated';
  created_at: string;
  updated_at: string;
}

export function useMarketStudies() {
  const queryClient = useQueryClient();

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ['market-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_studies' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as MarketStudy[];
    },
  });

  const uploadStudy = useMutation({
    mutationFn: async ({
      title,
      sector,
      description,
      file,
    }: {
      title: string;
      sector: string;
      description: string;
      file: File;
    }) => {
      const ext = file.name.split('.').pop();
      const storagePath = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('market-studies')
        .upload(storagePath, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: userData } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from('market_studies' as any)
        .insert({
          title,
          sector: sector || null,
          description: description || null,
          file_name: file.name,
          storage_path: storagePath,
          file_size: file.size,
          uploaded_by: userData?.user?.id || null,
        } as any);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-studies'] });
      toast({ title: 'Estudio subido correctamente' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al subir estudio', description: err.message, variant: 'destructive' });
    },
  });

  const deleteStudy = useMutation({
    mutationFn: async (study: MarketStudy) => {
      await supabase.storage.from('market-studies').remove([study.storage_path]);
      const { error } = await supabase
        .from('market_studies' as any)
        .delete()
        .eq('id', study.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-studies'] });
      toast({ title: 'Estudio eliminado' });
    },
    onError: (err: any) => {
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' });
    },
  });
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'validated' }) => {
      const { error } = await supabase
        .from('market_studies' as any)
        .update({ status } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-studies'] });
    },
    onError: (err: any) => {
      toast({ title: 'Error al actualizar estado', description: err.message, variant: 'destructive' });
    },
  });

  const getFileBlob = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('market-studies')
      .download(storagePath);
    if (error) {
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      throw new Error(msg);
    }
    return data;
  };

  const getSignedUrl = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('market-studies')
      .createSignedUrl(storagePath, 3600);
    if (error) {
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      throw new Error(msg);
    }
    return data.signedUrl;
  };

  return { studies, isLoading, uploadStudy, deleteStudy, updateStatus, getFileBlob };
}
