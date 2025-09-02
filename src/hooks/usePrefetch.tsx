import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook para prefetching inteligente de datos relacionados
export const usePrefetch = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const prefetchMarketingData = async () => {
    // Prefetch datos relacionados con marketing
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['contact_leads'],
        queryFn: () => supabase.from('contact_leads').select('*').order('created_at', { ascending: false }).limit(100),
        staleTime: 5 * 60 * 1000, // 5 minutos
      }),
      queryClient.prefetchQuery({
        queryKey: ['lead_scores'],
        queryFn: () => supabase.from('lead_scores').select('*').order('total_score', { ascending: false }).limit(50),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['company_valuations'],
        queryFn: () => supabase.from('company_valuations').select('*').order('created_at', { ascending: false }).limit(100),
        staleTime: 10 * 60 * 1000, // 10 minutos
      })
    ]);
  };

  const prefetchContentData = async () => {
    // Prefetch datos de contenido
    const promises = [
      queryClient.prefetchQuery({
        queryKey: ['blog_posts'],
        queryFn: () => supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(50),
        staleTime: 15 * 60 * 1000, // 15 minutos
      }),
      queryClient.prefetchQuery({
        queryKey: ['case_studies'],
        queryFn: () => supabase.from('case_studies').select('*').order('created_at', { ascending: false }),
        staleTime: 30 * 60 * 1000, // 30 minutos
      })
    ];

    // Only prefetch blog_analytics if user is admin
    if (isAdmin) {
      promises.push(
        queryClient.prefetchQuery({
          queryKey: ['blog_analytics'],
          queryFn: () => supabase.from('blog_analytics').select('*').order('viewed_at', { ascending: false }).limit(200),
          staleTime: 5 * 60 * 1000,
        })
      );
    }

    await Promise.all(promises);
  };

  const prefetchSystemData = async () => {
    // Prefetch datos del sistema
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['testimonials'],
        queryFn: () => supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
        staleTime: 30 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['team_members'],
        queryFn: () => supabase.from('team_members').select('*').order('display_order'),
        staleTime: 60 * 60 * 1000, // 1 hora
      })
    ]);
  };

  // Prefetch based on user navigation patterns
  useEffect(() => {
    // Prefetch data on component mount with slight delays to avoid overwhelming
    const timeouts = [
      setTimeout(prefetchMarketingData, 100),
      setTimeout(prefetchContentData, 500),
      setTimeout(prefetchSystemData, 1000)
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return {
    prefetchMarketingData,
    prefetchContentData,
    prefetchSystemData
  };
};

// Hook para caché predictivo basado en patrones
export const usePredictiveCache = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const invalidateRelatedQueries = (entityType: string) => {
    switch (entityType) {
      case 'leads':
        queryClient.invalidateQueries({ queryKey: ['contact_leads'] });
        queryClient.invalidateQueries({ queryKey: ['lead_scores'] });
        queryClient.invalidateQueries({ queryKey: ['marketing_metrics'] });
        break;
      case 'content':
        queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
        queryClient.invalidateQueries({ queryKey: ['blog_analytics'] });
        queryClient.invalidateQueries({ queryKey: ['content_performance'] });
        break;
      case 'valuations':
        queryClient.invalidateQueries({ queryKey: ['company_valuations'] });
        queryClient.invalidateQueries({ queryKey: ['business_metrics'] });
        break;
    }
  };

  const warmupCache = async (route: string) => {
    // Warm up cache based on intended navigation
    switch (route) {
      case '/admin/marketing-hub':
        await queryClient.prefetchQuery({
          queryKey: ['marketing_metrics'],
          queryFn: async () => {
            // Fetch marketing metrics
            const [leadsRes, scoresRes, valuationsRes] = await Promise.all([
              supabase.from('contact_leads').select('*'),
              supabase.from('lead_scores').select('*'),
              supabase.from('company_valuations').select('*')
            ]);
            return { leadsRes, scoresRes, valuationsRes };
          },
          staleTime: 2 * 60 * 1000
        });
        break;
      case '/admin/content-performance':
        if (isAdmin) {
          await queryClient.prefetchQuery({
            queryKey: ['content_analytics'],
            queryFn: async () => {
              const [postsRes, analyticsRes] = await Promise.all([
                supabase.from('blog_posts').select('*'),
                supabase.from('blog_analytics').select('*')
              ]);
              return { postsRes, analyticsRes };
            },
            staleTime: 5 * 60 * 1000
          });
        }
        break;
    }
  };

  return {
    invalidateRelatedQueries,
    warmupCache
  };
};