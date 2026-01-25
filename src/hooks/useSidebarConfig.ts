// Hook for reading sidebar configuration (used by AdminSidebar)

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarSectionWithItems, SidebarGlobalConfig, SidebarItem } from '@/types/sidebar-config';

type BadgeType = 'URGENTE' | 'AI' | 'NEW' | 'HOT' | null;

export const useSidebarConfig = () => {
  // Fetch sections with their items
  const sectionsQuery = useQuery({
    queryKey: ['sidebar', 'sections'],
    queryFn: async (): Promise<SidebarSectionWithItems[]> => {
      const { data: sections, error: sectionsError } = await supabase
        .from('sidebar_sections')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (sectionsError) throw sectionsError;

      const { data: items, error: itemsError } = await supabase
        .from('sidebar_items')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by section with proper typing
      const sectionsWithItems: SidebarSectionWithItems[] = (sections || []).map(section => ({
        ...section,
        items: (items || [])
          .filter(item => item.section_id === section.id)
          .map(item => ({
            ...item,
            badge: item.badge as BadgeType
          })) as SidebarItem[]
      }));

      return sectionsWithItems;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    retry: 2,
  });

  // Fetch global config
  const configQuery = useQuery({
    queryKey: ['sidebar', 'config'],
    queryFn: async (): Promise<SidebarGlobalConfig | null> => {
      const { data, error } = await supabase
        .from('sidebar_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    sections: sectionsQuery.data || [],
    globalConfig: configQuery.data,
    isLoading: sectionsQuery.isLoading || configQuery.isLoading,
    isError: sectionsQuery.isError || configQuery.isError,
    refetch: () => {
      sectionsQuery.refetch();
      configQuery.refetch();
    }
  };
};
