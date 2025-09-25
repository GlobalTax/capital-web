import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

const BANNERS_API_BASE = 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/banners_list';

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
};

const createBanner = async (bannerData: BannerFormData): Promise<Banner> => {
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
};

const updateBanner = async ({ id, data }: { id: string; data: Partial<BannerFormData> }): Promise<Banner> => {
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
};

const toggleBanner = async (id: string): Promise<Banner> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BANNERS_API_BASE}/banners/${id}/toggle`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to toggle banner: ${response.statusText}`);
  }

  return response.json();
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