import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/supabase';

export interface Banner {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_href: string | null;
  variant: 'solid' | 'gradient' | 'soft' | 'outline';
  color_primary: string;
  color_secondary: string | null;
  text_on_primary: string | null;
  position: 'top' | 'bottom';
  dismissible: boolean;
  rounded: string;
  shadow: boolean;
  align: 'left' | 'center';
  max_width: 'none' | '7xl';
  visible: boolean;
  audience: string[];
  pages: string[];
  start_at: string | null;
  end_at: string | null;
  priority: number;
  exclusive: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface BannerFormData {
  name: string;
  slug: string;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_href?: string;
  variant: 'solid' | 'gradient' | 'soft' | 'outline';
  color_primary: string;
  color_secondary?: string;
  text_on_primary?: string;
  position: 'top' | 'bottom';
  dismissible: boolean;
  rounded: string;
  shadow: boolean;
  align: 'left' | 'center';
  max_width: 'none' | '7xl';
  visible: boolean;
  audience: string[];
  pages: string[];
  start_at?: string;
  end_at?: string;
  priority: number;
  exclusive?: boolean;
}

interface BannersResponse {
  data: Banner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const BANNERS_API_BASE = `${SUPABASE_CONFIG.url}/functions/v1/banners_list`;

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

const fetchBanners = async (page: number = 1, limit: number = 20): Promise<BannersResponse> => {
  try {
    const headers = await getAuthHeaders();
    const url = new URL(`${BANNERS_API_BASE}/banners`);
    
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }

    return response.json();
  } catch (e) {
    // Fallback: direct DB query using RLS (works for admins)
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from('banners')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      data: (data || []) as unknown as Banner[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
};

const createBanner = async (bannerData: BannerFormData): Promise<Banner> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BANNERS_API_BASE}/banners`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bannerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create banner: ${response.statusText}`);
    }

    return response.json();
  } catch (e) {
    const { data, error } = await supabase
      .from('banners')
      .insert([bannerData as any])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Banner;
  }
};

const updateBanner = async ({ id, data }: { id: string; data: Partial<BannerFormData> }): Promise<Banner> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BANNERS_API_BASE}/banners/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update banner: ${response.statusText}`);
    }

    return response.json();
  } catch (e) {
    const { data: banner, error } = await supabase
      .from('banners')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return banner as unknown as Banner;
  }
};

const toggleBanner = async (id: string): Promise<Banner> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${BANNERS_API_BASE}/banners/${id}/toggle`, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle banner: ${response.statusText}`);
    }

    return response.json();
  } catch (e) {
    const { data: current, error: fetchError } = await supabase
      .from('banners')
      .select('visible')
      .eq('id', id)
      .single();

    if (fetchError || !current) throw fetchError || new Error('Banner not found');

    const { data: banner, error } = await supabase
      .from('banners')
      .update({ visible: !current.visible })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return banner as unknown as Banner;
  }
};

export const useBannersAdmin = (page: number = 1, limit: number = 20) => {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: ['bannersAdmin', page, limit],
    queryFn: () => fetchBanners(page, limit),
    staleTime: 1000 * 30, // 30 seconds
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['activeBanners'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['activeBanners'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['activeBanners'] });
    },
  });

  return {
    // Query
    banners: bannersQuery.data?.data || [],
    total: bannersQuery.data?.total || 0,
    totalPages: bannersQuery.data?.totalPages || 0,
    isLoading: bannersQuery.isLoading,
    error: bannersQuery.error,
    
    // Mutations
    createBanner: createMutation.mutateAsync,
    updateBanner: updateMutation.mutateAsync,
    toggleBanner: toggleMutation.mutateAsync,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
};