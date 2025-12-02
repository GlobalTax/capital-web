import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export const useLogoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PNG, JPG, JPEG, WEBP o SVG.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast({
        title: "Archivo demasiado grande",
        description: "El logo debe ser menor a 2MB.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `logos/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(data.path);

      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente.",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: `Error al subir el logo: ${error.message}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteLogo = async (url: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const urlParts = url.split('/company-logos/');
      if (urlParts.length < 2) return false;
      
      const path = urlParts[1];
      
      const { error } = await supabase.storage
        .from('company-logos')
        .remove([path]);

      if (error) throw error;
      
      toast({
        title: "Logo eliminado",
        description: "El logo se ha eliminado correctamente.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast({
        title: "Error",
        description: `Error al eliminar el logo: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadLogo,
    deleteLogo,
    isUploading
  };
};
