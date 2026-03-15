import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeadMagnet, DownloadFormData, LeadMagnetFormData } from '@/types/leadMagnets';

const QUERY_KEY = 'lead_magnets';

export const useLeadMagnets = () => {
  const queryClient = useQueryClient();

  const { data: leadMagnets = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadMagnet[];
    }
  });

  const createLeadMagnet = useMutation({
    mutationFn: async (formData: Omit<Partial<LeadMagnet>, 'id' | 'download_count' | 'lead_conversion_count' | 'created_at' | 'updated_at'> & { title: string; type: LeadMagnet['type']; sector: string; description: string }) => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const updateLeadMagnet = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeadMagnet> & { id: string }) => {
      const { data, error } = await supabase
        .from('lead_magnets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'draft' | 'archived' }) => {
      const { error } = await supabase
        .from('lead_magnets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const deleteLeadMagnet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_magnets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('lead-magnets')
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('lead-magnets')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  return {
    leadMagnets,
    isLoading,
    error,
    createLeadMagnet,
    updateLeadMagnet,
    toggleStatus,
    deleteLeadMagnet,
    uploadFile
  };
};

export const useLeadMagnetDownloads = () => {
  const resolveLeadMagnetId = async (idOrSlug: string): Promise<string> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(idOrSlug)) return idOrSlug;

    const { data, error } = await supabase
      .from('lead_magnets')
      .select('id')
      .eq('landing_page_slug', idOrSlug)
      .single();

    if (error || !data) throw new Error(`Lead magnet not found for slug: ${idOrSlug}`);
    return data.id;
  };

  const recordDownload = async (idOrSlug: string, formData: DownloadFormData) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] === LEAD MAGNET DOWNLOAD START ===`);
    console.log('Lead magnet ID/slug:', idOrSlug);

    try {
      const leadMagnetId = await resolveLeadMagnetId(idOrSlug);

      const { error } = await supabase
        .from('lead_magnet_downloads')
        .insert([{
          lead_magnet_id: leadMagnetId,
          user_email: formData.user_email,
          user_name: formData.user_name,
          user_company: formData.user_company,
          user_phone: formData.user_phone,
          referrer: typeof window !== 'undefined' ? window.location.href : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        }]);

      if (error) {
        console.error('Error recording download:', error);
        throw error;
      }

      console.log(`[${timestamp}] Lead magnet download recorded successfully`);
    } catch (error) {
      console.error('Error in lead magnet download:', error);
      throw error;
    }
  };

  return { recordDownload };
};
