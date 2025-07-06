import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleBlogMetrics {
  totalViews: number;
  uniqueViews: number;
  avgReadingTime: number;
  lastViewed: string | null;
}

export const useSimpleBlogAnalytics = () => {
  const [metrics, setMetrics] = useState<Record<string, SimpleBlogMetrics>>({});
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
    try {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return 0;
      const percentage = Math.round((scrollTop / scrollHeight) * 100);
      return Math.min(Math.max(percentage, 0), 100);
    } catch {
      return 0;
    }
  };

  // Registrar vista de post - SIMPLIFICADO
  const trackPostView = async (postId: string, postSlug: string) => {
    if (hasTrackedView.current) return;
    
    try {
      // Solo insertar registro básico
      const { error } = await supabase
        .from('blog_analytics')
        .insert([{
          post_id: postId,
          post_slug: postSlug,
          visitor_id: getVisitorId(),
          session_id: getSessionId(),
          ip_address: null,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          reading_time: 0,
          scroll_percentage: 0
        }]);

      if (error) {
        console.warn('Error tracking post view:', error);
        return;
      }

      hasTrackedView.current = true;
      startTime.current = Date.now();

    } catch (error) {
      console.warn('Error tracking post view:', error);
    }
  };

  // Obtener métricas básicas - SIMPLIFICADO
  const getPostMetrics = async (postId: string): Promise<SimpleBlogMetrics | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_post_metrics')
        .select('total_views, unique_views, avg_reading_time, last_viewed')
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignorar "not found"
        console.warn('Error fetching post metrics:', error);
        return null;
      }

      if (!data) return null;

      return {
        totalViews: data.total_views || 0,
        uniqueViews: data.unique_views || 0,
        avgReadingTime: data.avg_reading_time || 0,
        lastViewed: data.last_viewed
      };
    } catch (error) {
      console.warn('Error fetching post metrics:', error);
      return null;
    }
  };

  // Obtener posts más populares - SIMPLIFICADO
  const getPopularPosts = async (limit = 5) => {
    try {
      setIsLoading(true);
      
      // Query simplificado sin relación compleja
      const { data: metricsData, error } = await supabase
        .from('blog_post_metrics')
        .select('post_id, post_slug, total_views, unique_views, last_viewed')
        .order('total_views', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Error fetching popular posts:', error);
        return [];
      }

      if (!metricsData || metricsData.length === 0) return [];

      // Obtener detalles de posts por separado
      const postIds = metricsData.map(m => m.post_id);
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image_url, category, author_name, reading_time, published_at, created_at')
        .in('id', postIds)
        .eq('is_published', true);

      if (postsError) {
        console.warn('Error fetching post details:', postsError);
        return [];
      }

      // Combinar datos
      const combinedData = metricsData.map(metric => {
        const post = postsData?.find(p => p.id === metric.post_id);
        return {
          ...metric,
          blog_posts: post || null
        };
      }).filter(item => item.blog_posts);

      return combinedData;
    } catch (error) {
      console.warn('Error fetching popular posts:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Hook para trackear scroll - SIMPLIFICADO
  const useScrollTracking = (postId: string, postSlug: string) => {
    useEffect(() => {
      let scrollTimeout: NodeJS.Timeout;

      const handleScroll = () => {
        // Debounce para evitar demasiadas llamadas
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const currentScroll = calculateScrollPercentage();
          if (currentScroll > maxScroll.current) {
            maxScroll.current = currentScroll;
          }
        }, 250);
      };

      // Solo actualizar métricas al salir de la página
      const handleBeforeUnload = async () => {
        if (hasTrackedView.current && (maxScroll.current > 10 || Date.now() - startTime.current > 10000)) {
          const readingTime = Math.round((Date.now() - startTime.current) / 1000);
          
          // Envío rápido sin esperar respuesta
          navigator.sendBeacon && navigator.sendBeacon('/api/track-engagement', JSON.stringify({
            post_id: postId,
            reading_time: Math.min(readingTime, 600), // Máximo 10 minutos
            scroll_percentage: maxScroll.current
          }));
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearTimeout(scrollTimeout);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('beforeunload', handleBeforeUnload);
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