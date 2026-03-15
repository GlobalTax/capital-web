
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BUCKET = 'admin-photos';

export interface PhotoFile {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata: { size: number; mimetype: string } | null;
  publicUrl: string;
}

export const usePhotoLibrary = (search: string = '') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: photos = [], isLoading, refetch } = useQuery({
    queryKey: ['photo-library', search],
    queryFn: async (): Promise<PhotoFile[]> => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(undefined, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

      console.log('Photo library list result:', { count: data?.length, error });
      if (error) throw error;
      if (!data) return [];

      const filtered = search
        ? data.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
        : data;

      return filtered
        .filter(f => f.name !== '.emptyFolderPlaceholder')
        .map(f => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return {
            name: f.name,
            id: f.id ?? f.name,
            created_at: f.created_at ?? '',
            updated_at: f.updated_at ?? '',
            metadata: f.metadata as PhotoFile['metadata'],
            publicUrl: urlData.publicUrl,
          };
        });
    },
    staleTime: 1000 * 60,
  });

  const uploadPhotos = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);
    let uploaded = 0;

    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: 'Error', description: `${file.name} supera 10MB`, variant: 'destructive' });
          continue;
        }

        const ext = file.name.split('.').pop();
        const safeName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { error } = await supabase.storage.from(BUCKET).upload(safeName, file);
        if (error) {
          toast({ title: 'Error', description: `Error subiendo ${file.name}: ${error.message}`, variant: 'destructive' });
        } else {
          uploaded++;
        }
        setUploadProgress(Math.round(((uploaded) / files.length) * 100));
      }

      if (uploaded > 0) {
        toast({ title: '✅ Subida completada', description: `${uploaded} foto(s) subida(s)` });
        queryClient.invalidateQueries({ queryKey: ['photo-library'] });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [toast, queryClient]);

  const deletePhoto = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([name]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Eliminada', description: 'Foto eliminada correctamente' });
    queryClient.invalidateQueries({ queryKey: ['photo-library'] });
    return true;
  }, [toast, queryClient]);

  return { photos, isLoading, isUploading, uploadProgress, uploadPhotos, deletePhoto, refetch };
};
