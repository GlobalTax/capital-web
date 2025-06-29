
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LeadMagnet, LeadMagnetFormData, DownloadFormData } from '@/types/leadMagnets';

export const useLeadMagnets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener todos los lead magnets
  const { data: leadMagnets, isLoading } = useQuery({
    queryKey: ['leadMagnets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadMagnet[];
    },
  });

  // Obtener lead magnets activos (público)
  const { data: activeLeadMagnets, isLoading: isLoadingActive } = useQuery({
    queryKey: ['activeLeadMagnets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadMagnet[];
    },
  });

  // Crear lead magnet
  const createLeadMagnet = useMutation({
    mutationFn: async (formData: LeadMagnetFormData) => {
      // Generar slug único
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const { data, error } = await supabase
        .from('lead_magnets')
        .insert({
          ...formData,
          landing_page_slug: slug,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadMagnets'] });
      toast({
        title: "Lead Magnet creado",
        description: "El lead magnet ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creando lead magnet:', error);
      toast({
        title: "Error",
        description: "Error al crear el lead magnet. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Actualizar lead magnet
  const updateLeadMagnet = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LeadMagnet> }) => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadMagnets'] });
      toast({
        title: "Lead Magnet actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error actualizando lead magnet:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el lead magnet.",
        variant: "destructive",
      });
    },
  });

  // Eliminar lead magnet
  const deleteLeadMagnet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_magnets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadMagnets'] });
      toast({
        title: "Lead Magnet eliminado",
        description: "El lead magnet ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error eliminando lead magnet:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el lead magnet.",
        variant: "destructive",
      });
    },
  });

  return {
    leadMagnets,
    activeLeadMagnets,
    isLoading,
    isLoadingActive,
    createLeadMagnet,
    updateLeadMagnet,
    deleteLeadMagnet,
  };
};

export const useLeadMagnetDownloads = () => {
  const { toast } = useToast();

  const recordDownload = async (leadMagnetId: string, formData: DownloadFormData) => {
    try {
      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;

      // Registrar descarga
      const { data, error } = await supabase
        .from('lead_magnet_downloads')
        .insert({
          lead_magnet_id: leadMagnetId,
          ...formData,
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        })
        .select()
        .single();

      if (error) throw error;

      // Incrementar contador de descargas usando una query SQL directa
      const { error: updateError } = await supabase
        .from('lead_magnets')
        .update({ 
          download_count: await getCurrentDownloadCount(leadMagnetId) + 1
        })
        .eq('id', leadMagnetId);

      if (updateError) {
        console.error('Error actualizando contador:', updateError);
      }

      // Sincronizar con segunda base de datos
      try {
        await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'lead_magnet_download',
            data: {
              ...data,
              ip_address: ipData?.ip,
              user_agent: navigator.userAgent,
            }
          }
        });
      } catch (syncError) {
        console.error('Error sincronizando descarga:', syncError);
      }

      toast({
        title: "¡Descarga registrada!",
        description: "Tu descarga comenzará en breve. Revisa tu email para acceso futuro.",
      });

      return data;
    } catch (error) {
      console.error('Error registrando descarga:', error);
      toast({
        title: "Error",
        description: "Error al procesar la descarga. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Función auxiliar para obtener el conteo actual
  const getCurrentDownloadCount = async (leadMagnetId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('lead_magnets')
      .select('download_count')
      .eq('id', leadMagnetId)
      .single();

    if (error) {
      console.error('Error obteniendo conteo:', error);
      return 0;
    }

    return data?.download_count || 0;
  };

  return {
    recordDownload,
  };
};
