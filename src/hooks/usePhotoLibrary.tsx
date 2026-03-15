
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
  fullPath: string;
}

export interface FolderItem {
  name: string;
}

export const usePhotoLibrary = (search: string = '', currentFolder: string = '') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['photo-library', search, currentFolder],
    queryFn: async (): Promise<{ photos: PhotoFile[]; folders: FolderItem[] }> => {
      const normalizedSearch = search.trim().toLowerCase();
      const listPath = currentFolder || '';

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(listPath, { limit: 500, sortBy: { column: 'name', order: 'asc' } });

      console.log('Photo library list result:', { folder: currentFolder, count: data?.length, error });
      if (error) throw error;
      if (!data) return { photos: [], folders: [] };

      const folders: FolderItem[] = [];
      const photos: PhotoFile[] = [];

      for (const f of data) {
        if (f.name === '.emptyFolderPlaceholder') continue;

        // En algunos responses de Storage, la carpeta viene con id null o undefined
        if (f.id == null) {
          if (!normalizedSearch || f.name.toLowerCase().includes(normalizedSearch)) {
            folders.push({ name: f.name });
          }
          continue;
        }

        if (normalizedSearch && !f.name.toLowerCase().includes(normalizedSearch)) continue;

        const fullPath = currentFolder ? `${currentFolder}/${f.name}` : f.name;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);

        photos.push({
          name: f.name,
          id: f.id ?? f.name,
          created_at: f.created_at ?? '',
          updated_at: f.updated_at ?? '',
          metadata: f.metadata as PhotoFile['metadata'],
          publicUrl: urlData.publicUrl,
          fullPath,
        });
      }

      return { photos, folders };
    },
    staleTime: 1000 * 60,
  });

  const photos = data?.photos ?? [];
  const folders = data?.folders ?? [];

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
        const fullPath = currentFolder ? `${currentFolder}/${safeName}` : safeName;

        const { error } = await supabase.storage.from(BUCKET).upload(fullPath, file);
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
  }, [toast, queryClient, currentFolder]);

  const deletePhoto = useCallback(async (fullPath: string) => {
    const { error } = await supabase.storage.from(BUCKET).remove([fullPath]);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    }
    toast({ title: 'Eliminada', description: 'Foto eliminada correctamente' });
    queryClient.invalidateQueries({ queryKey: ['photo-library'] });
    return true;
  }, [toast, queryClient]);

  const createFolder = useCallback(async (name: string) => {
    const folderPath = currentFolder ? `${currentFolder}/${name}/.emptyFolderPlaceholder` : `${name}/.emptyFolderPlaceholder`;
    const { error } = await supabase.storage.from(BUCKET).upload(folderPath, new Blob(['']));
    if (error) {
      toast({ title: 'Error', description: `Error creando carpeta: ${error.message}`, variant: 'destructive' });
      return false;
    }
    toast({ title: '📁 Carpeta creada', description: `Carpeta "${name}" creada` });
    queryClient.invalidateQueries({ queryKey: ['photo-library'] });
    return true;
  }, [toast, queryClient, currentFolder]);

  const deleteFolder = useCallback(async (name: string) => {
    const folderPath = currentFolder ? `${currentFolder}/${name}` : name;
    const { data: files, error: listError } = await supabase.storage.from(BUCKET).list(folderPath, { limit: 1000 });
    if (listError) {
      toast({ title: 'Error', description: listError.message, variant: 'destructive' });
      return false;
    }

    if (files && files.length > 0) {
      const filePaths = files.map(f => `${folderPath}/${f.name}`);
      const { error: removeError } = await supabase.storage.from(BUCKET).remove(filePaths);
      if (removeError) {
        toast({ title: 'Error', description: removeError.message, variant: 'destructive' });
        return false;
      }
    }

    toast({ title: '🗑️ Carpeta eliminada', description: `Carpeta "${name}" eliminada` });
    queryClient.invalidateQueries({ queryKey: ['photo-library'] });
    return true;
  }, [toast, queryClient, currentFolder]);

  const movePhoto = useCallback(async (sourceFullPath: string, targetFolder: string) => {
    const fileName = sourceFullPath.split('/').pop();
    if (!fileName) return false;

    const destPath = targetFolder ? `${targetFolder}/${fileName}` : fileName;

    if (sourceFullPath === destPath) return false;

    // Download the file, then upload to new location, then delete old
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(sourceFullPath);

    if (downloadError || !fileData) {
      toast({ title: 'Error', description: `Error descargando: ${downloadError?.message}`, variant: 'destructive' });
      return false;
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(destPath, fileData, { upsert: false });

    if (uploadError) {
      toast({ title: 'Error', description: `Error moviendo: ${uploadError.message}`, variant: 'destructive' });
      return false;
    }

    const { error: removeError } = await supabase.storage.from(BUCKET).remove([sourceFullPath]);
    if (removeError) {
      toast({ title: 'Aviso', description: `Copiada pero no se pudo eliminar original: ${removeError.message}`, variant: 'destructive' });
    }

    const folderName = targetFolder || 'raíz';
    toast({ title: '📁 Foto movida', description: `Movida a "${folderName}"` });
    queryClient.invalidateQueries({ queryKey: ['photo-library'] });
    return true;
  }, [toast, queryClient]);

  return { photos, folders, isLoading, isError, error, isUploading, uploadProgress, uploadPhotos, deletePhoto, createFolder, deleteFolder, movePhoto, refetch };
};
