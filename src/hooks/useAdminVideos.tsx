import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminVideo {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  thumbnail_url?: string;
  category: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  file_type: string;
  is_active: boolean;
  display_locations: string[];
  view_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAdminVideos = () => {
  const queryClient = useQueryClient();

  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminVideo[];
    }
  });

  const { data: activeVideos } = useQuery({
    queryKey: ['admin-videos', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminVideo[];
    }
  });

  const getVideosByCategory = (category: string) => {
    return useQuery({
      queryKey: ['admin-videos', 'category', category],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_videos')
          .select('*')
          .eq('category', category)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as AdminVideo[];
      }
    });
  };

  const getVideosByLocation = (location: string) => {
    return useQuery({
      queryKey: ['admin-videos', 'location', location],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('admin_videos')
          .select('*')
          .contains('display_locations', [location])
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as AdminVideo[];
      }
    });
  };

  const incrementViewCount = useMutation({
    mutationFn: async (videoId: string) => {
      // First get current view count
      const { data: currentVideo } = await supabase
        .from('admin_videos')
        .select('view_count')
        .eq('id', videoId)
        .single();
      
      if (currentVideo) {
        const { error } = await supabase
          .from('admin_videos')
          .update({ view_count: currentVideo.view_count + 1 })
          .eq('id', videoId);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
    }
  });

  return {
    videos,
    activeVideos,
    isLoading,
    error,
    getVideosByCategory,
    getVideosByLocation,
    incrementViewCount: incrementViewCount.mutate
  };
};