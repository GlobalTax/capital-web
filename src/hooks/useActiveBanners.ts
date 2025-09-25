import { useQuery } from '@tanstack/react-query';

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

const fetchActiveBanners = async (path: string, audience: AudienceType): Promise<BannerData[]> => {
  const baseUrl = 'https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/banners_list';
  const url = new URL(`${baseUrl}/banners/active`);
  
  url.searchParams.set('path', path);
  url.searchParams.set('audience', audience);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch banners: ${response.statusText}`);
  }

  return response.json();
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