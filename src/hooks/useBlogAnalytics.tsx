import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlogAnalyticsData {
  postId: string;
  postSlug: string;
  visitorId?: string;
  sessionId: string;
  readingTime?: number;
  scrollPercentage?: number;
}

interface BlogMetrics {
  totalViews: number;
  uniqueViews: number;
  avgReadingTime: number;
  avgScrollPercentage: number;
  lastViewed: string | null;
}

export const useBlogAnalytics = () => {
  const [metrics, setMetrics] = useState<Record<string, BlogMetrics>>({});
  const [isLoading, setIsLoading] = useState(false);
  const startTime = useRef<number>(Date.now());
  const maxScroll = useRef<number>(0);
  const hasTrackedView = useRef<boolean>(false);

  // Generar ID de sesión único
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('blog_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('blog_session_id', sessionId);
    }
    return sessionId;
  };

  // Generar ID de visitante (más persistente)
  const getVisitorId = (): string => {
    let visitorId = localStorage.getItem('blog_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('blog_visitor_id', visitorId);
    }
    return visitorId;
  };

  // Calcular porcentaje de scroll
  const calculateScrollPercentage = (): number => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = Math.round((scrollTop / scrollHeight) * 100);
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Registrar vista de post
  const trackPostView = async (postId: string, postSlug: string) => {
    if (hasTrackedView.current) return;
    
    try {
      const analyticsData: BlogAnalyticsData = {
        postId,
        postSlug,
        visitorId: getVisitorId(),
        sessionId: getSessionId()
      };

      const { error } = await supabase
        .from('blog_analytics')
        .insert([{
          post_id: analyticsData.postId,
          post_slug: analyticsData.postSlug,
          visitor_id: analyticsData.visitorId,
          session_id: analyticsData.sessionId,
          ip_address: null, // Se puede obtener del servidor
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          reading_time: 0,
          scroll_percentage: 0
        }]);

      if (error) {
        console.error('Error tracking post view:', error);
        return;
      }

      hasTrackedView.current = true;
      startTime.current = Date.now();

    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  };

  // Actualizar métricas de engagement
  const updateEngagementMetrics = async (postId: string, postSlug: string) => {
    try {
      const readingTime = Math.round((Date.now() - startTime.current) / 1000); // en segundos
      const scrollPercentage = maxScroll.current;

      // Solo actualizar si hay engagement significativo
      if (readingTime < 5 && scrollPercentage < 10) return;

      const { error } = await supabase
        .from('blog_analytics')
        .insert([{
          post_id: postId,
          post_slug: postSlug,
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          reading_time: readingTime,
          scroll_percentage: scrollPercentage
        }]);

      if (error) {
        console.error('Error updating engagement metrics:', error);
      }
    } catch (error) {
      console.error('Error updating engagement metrics:', error);
    }
  };

  // Obtener métricas de un post
  const getPostMetrics = async (postId: string): Promise<BlogMetrics | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_post_metrics')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error) {
        console.error('Error fetching post metrics:', error);
        return null;
      }

      return {
        totalViews: data.total_views || 0,
        uniqueViews: data.unique_views || 0,
        avgReadingTime: data.avg_reading_time || 0,
        avgScrollPercentage: data.avg_scroll_percentage || 0,
        lastViewed: data.last_viewed
      };
    } catch (error) {
      console.error('Error fetching post metrics:', error);
      return null;
    }
  };

  // Obtener posts más populares
  const getPopularPosts = async (limit = 10) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_post_metrics')
        .select(`
          id,
          post_id,
          post_slug,
          total_views,
          unique_views,
          avg_reading_time,
          avg_scroll_percentage,
          last_viewed
        `)
        .order('total_views', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular posts:', error);
        return [];
      }

      // Obtener detalles de los posts por separado
      if (!data || data.length === 0) return [];

      const postIds = data.map(metric => metric.post_id);
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image_url, category, author_name, reading_time, published_at, created_at')
        .in('id', postIds)
        .eq('is_published', true);

      if (postsError) {
        console.error('Error fetching post details:', postsError);
        return [];
      }

      // Combinar métricas con detalles de posts
      const combinedData = data.map(metric => {
        const post = posts?.find(p => p.id === metric.post_id);
        return {
          ...metric,
          blog_posts: post
        };
      }).filter(item => item.blog_posts); // Solo incluir posts que existan

      return combinedData || [];
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Hook para trackear scroll en tiempo real
  const useScrollTracking = (postId: string, postSlug: string) => {
    useEffect(() => {
      const handleScroll = () => {
        const currentScroll = calculateScrollPercentage();
        if (currentScroll > maxScroll.current) {
          maxScroll.current = currentScroll;
        }
      };

      const handleBeforeUnload = () => {
        if (hasTrackedView.current) {
          updateEngagementMetrics(postId, postSlug);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Actualizar métricas cada 30 segundos si hay engagement
      const interval = setInterval(() => {
        if (hasTrackedView.current) {
          updateEngagementMetrics(postId, postSlug);
        }
      }, 30000);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        clearInterval(interval);
      };
    }, [postId, postSlug]);
  };

  return {
    metrics,
    isLoading,
    trackPostView,
    getPostMetrics,
    getPopularPosts,
    useScrollTracking
  };
};