import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CorporateBuyerFile {
  id: string;
  buyer_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number | null;
  storage_path: string;
  public_url: string;
  uploaded_by: string | null;
  notes: string | null;
  created_at: string;
}

export const useCorporateBuyerFiles = (buyerId?: string) => {
  return useQuery({
    queryKey: ['corporate-buyer-files', buyerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_buyer_files' as any)
        .select('*')
        .eq('buyer_id', buyerId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as CorporateBuyerFile[];
    },
    enabled: !!buyerId,
  });
};

export const useUploadCorporateBuyerFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, buyerId, notes }: { file: File; buyerId: string; notes?: string }) => {
      const fileExt = file.name.split('.').pop();
      const storagePath = `${buyerId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('corporate-buyer-files')
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('corporate-buyer-files')
        .getPublicUrl(storagePath);

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase
        .from('corporate_buyer_files' as any)
        .insert({
          buyer_id: buyerId,
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
    onSuccess: (_, { buyerId }) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyer-files', buyerId] });
      toast({ title: 'Archivo subido correctamente' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al subir archivo', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteCorporateBuyerFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file }: { file: CorporateBuyerFile }) => {
      const { error: storageError } = await supabase.storage
        .from('corporate-buyer-files')
        .remove([file.storage_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('corporate_buyer_files' as any)
        .delete()
        .eq('id', file.id);
      if (dbError) throw dbError;

      return file.buyer_id;
    },
    onSuccess: (buyerId) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyer-files', buyerId] });
      toast({ title: 'Archivo eliminado' });
    },
    onError: (error: any) => {
      toast({ title: 'Error al eliminar archivo', description: error.message, variant: 'destructive' });
    },
  });
};
