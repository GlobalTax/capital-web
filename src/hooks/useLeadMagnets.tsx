import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LeadMagnet, DownloadFormData, LeadMagnetFormData } from '@/types/leadMagnets';

const QUERY_KEY = 'lead_magnets';

export const useLeadMagnets = () => {
  const queryClient = useQueryClient();

  // Fetch all lead magnets
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

  // Create lead magnet
  const createLeadMagnet = useMutation({
    mutationFn: async (formData: LeadMagnetFormData) => {
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

  // Update lead magnet
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

  // Toggle status (active/draft/archived)
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

  // Delete lead magnet
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

  return {
    leadMagnets,
    isLoading,
    error,
    createLeadMagnet,
    updateLeadMagnet,
    toggleStatus,
    deleteLeadMagnet
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
