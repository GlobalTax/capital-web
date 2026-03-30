import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SFFundFile {
  id: string;
  fund_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number | null;
  storage_path: string;
  public_url: string;
  uploaded_by: string | null;
  notes: string | null;
  created_at: string;
}

export const useSFFundFiles = (fundId?: string) => {
  return useQuery({
    queryKey: ['sf-fund-files', fundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_fund_files')
        .select('*')
        .eq('fund_id', fundId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SFFundFile[];
    },
    enabled: !!fundId,
  });
};

export const useUploadSFFundFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, fundId, notes }: { file: File; fundId: string; notes?: string }) => {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${fundId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sf-fund-files')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sf-fund-files')
        .getPublicUrl(storagePath);

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from('sf_fund_files')
        .insert({
          fund_id: fundId,
          file_name: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size_bytes: file.size,
          storage_path: storagePath,
          public_url: publicUrl,
          uploaded_by: user?.id || null,
          notes: notes || null,
        });
      if (dbError) throw dbError;
    },
    onSuccess: (_, { fundId }) => {
      queryClient.invalidateQueries({ queryKey: ['sf-fund-files', fundId] });
      toast({ title: 'Archivo subido correctamente' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al subir archivo', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteSFFundFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file }: { file: SFFundFile }) => {
      const { error: storageError } = await supabase.storage
        .from('sf-fund-files')
        .remove([file.storage_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('sf_fund_files')
        .delete()
        .eq('id', file.id);
      if (dbError) throw dbError;

      return file.fund_id;
    },
    onSuccess: (fundId) => {
      queryClient.invalidateQueries({ queryKey: ['sf-fund-files', fundId] });
      toast({ title: 'Archivo eliminado' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al eliminar archivo', description: error.message, variant: 'destructive' });
    },
  });
};
