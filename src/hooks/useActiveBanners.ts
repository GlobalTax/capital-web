import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BannerData {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  variant: 'solid' | 'gradient' | 'soft' | 'outline';
  colorScheme: {
    primary: string;
    secondary?: string;
    textOnPrimary?: string;
  };
  position: 'top' | 'bottom';
  dismissible: boolean;
  rounded: string;
  shadow: boolean;
  align: 'left' | 'center';
  maxWidth: 'none' | '7xl';
  show: boolean;
  version: string;
}

type AudienceType = 'all' | 'anon' | 'auth' | 'role:admin' | 'role:manager';

interface UseActiveBannersOptions {
  enabled?: boolean;
}

// Fallback: fetch directly from Supabase if Edge Function fails
const fetchBannersDirectly = async (path: string, audience: AudienceType): Promise<BannerData[]> => {
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .eq('visible', true);

  if (error) throw error;
  if (!banners) return [];

  const now = new Date();
  
  // Client-side filtering
  const filtered = banners.filter(banner => {
    const startOk = !banner.start_at || new Date(banner.start_at) <= now;
    const endOk = !banner.end_at || new Date(banner.end_at) >= now;
    const audienceMatch = banner.audience.includes('all') || banner.audience.includes(audience);
    const pageMatch = banner.pages.includes('all') || banner.pages.includes(path);
    
    return startOk && endOk && audienceMatch && pageMatch;
  });

  // Sort by priority DESC
  filtered.sort((a, b) => b.priority - a.priority);

  // Transform to UI format
  return filtered.map(banner => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    ctaText: banner.cta_text,
    ctaHref: banner.cta_href,
    variant: banner.variant as 'solid' | 'gradient' | 'soft' | 'outline',
    colorScheme: {
      primary: banner.color_primary,
      secondary: banner.color_secondary,
      textOnPrimary: banner.text_on_primary,
    },
    position: banner.position as 'top' | 'bottom',
    dismissible: banner.dismissible,
    rounded: banner.rounded,
    shadow: banner.shadow,
    align: banner.align as 'left' | 'center',
    maxWidth: banner.max_width as 'none' | '7xl',
    show: banner.visible,
    version: banner.version.toString(),
  }));
};

const fetchActiveBanners = async (path: string, audience: AudienceType): Promise<BannerData[]> => {
  const baseUrl = 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/banners_list';
  const url = new URL(`${baseUrl}/banners/active`);
  
  url.searchParams.set('path', path);
  url.searchParams.set('audience', audience);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If Edge Function fails with 401/403, use fallback
    if (!response.ok) {
      console.warn(`Edge Function failed (${response.status}), using direct query fallback`);
      return fetchBannersDirectly(path, audience);
    }

    return response.json();
  } catch (error) {
    console.warn('Edge Function error, using direct query fallback:', error);
    return fetchBannersDirectly(path, audience);
  }
};

export const useActiveBanners = (
  path: string, 
  audience: AudienceType = 'anon',
  options: UseActiveBannersOptions = {}
) => {
  return useQuery({
    queryKey: ['activeBanners', path, audience],
    queryFn: () => fetchActiveBanners(path, audience),
    staleTime: 1000 * 60, // 60 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    enabled: options.enabled !== false,
  });
};