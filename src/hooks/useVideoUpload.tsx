import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadVideo = async (file: File, title: string, description?: string, category: string = 'general'): Promise<string | null> => {
    if (!file) return null;

    // Validar tipo de archivo
    const validTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de video (MP4, WebM, MOV).",
        variant: "destructive",
      });
      return null;
    }

    // Validar tamaño (50MB máximo)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo debe ser menor a 50MB.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Subir archivo a storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('admin-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('admin-videos')
        .getPublicUrl(uploadData.path);

      // Crear entrada en la base de datos
      const { data: videoData, error: dbError } = await supabase
        .from('admin_videos')
        .insert({
          title,
          description,
          file_url: publicUrl,
          category,
          file_size_bytes: file.size,
          file_type: file.type,
          display_locations: [category]
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Video subido correctamente.",
      });

      return videoData.id;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al subir video: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteVideo = async (videoId: string): Promise<boolean> => {
    try {
      // Obtener información del video
      const { data: video, error: fetchError } = await supabase
        .from('admin_videos')
        .select('file_url')
        .eq('id', videoId)
        .single();

      if (fetchError) throw fetchError;

      // Extraer path del archivo
      const url = new URL(video.file_url);
      const path = url.pathname.split('/').slice(-2).join('/');

      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('admin-videos')
        .remove([path]);

      if (storageError) throw storageError;

      // Eliminar entrada de la base de datos
      const { error: dbError } = await supabase
        .from('admin_videos')
        .delete()
        .eq('id', videoId);

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: "Video eliminado correctamente.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al eliminar video: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateVideo = async (videoId: string, updates: {
    title?: string;
    description?: string;
    category?: string;
    display_locations?: string[];
    is_active?: boolean;
  }): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('admin_videos')
        .update(updates)
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Video actualizado correctamente.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al actualizar video: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    updateVideo,
    isUploading
  };
};