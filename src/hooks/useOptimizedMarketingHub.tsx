
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { devLogger } from '@/utils/devLogger';

interface OptimizedMarketingMetrics {
  totalVisitors: number;
  identifiedCompanies: number;
  totalLeads: number;
  qualifiedLeads: number;
  leadConversionRate: number;
  averageLeadScore: number;
  totalRevenue: number;
  contentMetrics: {
    totalViews: number;
    totalPosts: number;
    averageReadingTime: number;
    topContent: string[];
  };
  leadScoring: {
    hotLeads: number;
    mediumLeads: number;
    coldLeads: number;
    totalEvents: number;
    conversionRate: number;
  };
}

export const useOptimizedMarketingHub = () => {
  // Consulta unificada que obtiene todos los datos necesarios de una vez
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['marketing_hub_unified'],
    queryFn: async () => {
      devLogger.info('Fetching unified marketing data', undefined, 'marketing', 'useOptimizedMarketingHub');
      
      const startTime = performance.now();
      
      try {
        // Ejecutar todas las consultas en paralelo pero de forma optimizada
        const [
          contactLeadsRes,
          leadScoresRes,
          companyValuationsRes,
          blogAnalyticsRes,
          blogPostMetricsRes,
          leadBehaviorRes
        ] = await Promise.all([
          supabase
            .from('contact_leads')
            .select('id, created_at, company_name, email')
            .order('created_at', { ascending: false })
            .limit(1000), // Limitar para evitar sobrecarga
          supabase
            .from('lead_scores')
            .select('id, total_score, company_domain, company_name')
            .order('total_score', { ascending: false })
            .limit(500),
          supabase
            .from('company_valuations')
            .select('id, final_valuation, company_name, created_at')
            .order('created_at', { ascending: false })
            .limit(500),
          supabase
            .from('blog_analytics')
            .select('id, post_id, viewed_at')
            .order('viewed_at', { ascending: false })
            .limit(2000),
          supabase
            .from('blog_post_metrics')
            .select('id, post_slug, total_views, unique_views, avg_reading_time')
            .order('total_views', { ascending: false })
            .limit(100),
          supabase
            .from('lead_behavior_events')
            .select('id, event_type, created_at')
            .order('created_at', { ascending: false })
            .limit(1000)
        ]);

        const endTime = performance.now();
        devLogger.info(`Unified query completed in ${endTime - startTime}ms`, undefined, 'performance', 'useOptimizedMarketingHub');

        return {
          contactLeads: contactLeadsRes.data || [],
          leadScores: leadScoresRes.data || [],
          companyValuations: companyValuationsRes.data || [],
          blogAnalytics: blogAnalyticsRes.data || [],
          blogPostMetrics: blogPostMetricsRes.data || [],
          leadBehavior: leadBehaviorRes.data || []
        };
      } catch (error) {
        devLogger.error('Error fetching unified marketing data', error, 'marketing', 'useOptimizedMarketingHub');
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Memoizar los cálculos para evitar recalcular en cada render
  const optimizedMetrics = useMemo((): OptimizedMarketingMetrics | null => {
    if (!rawData) return null;

    const {
      contactLeads,
      leadScores,
      companyValuations,
      blogAnalytics,
      blogPostMetrics,
      leadBehavior
    } = rawData;

    // Calcular métricas de forma optimizada
    const totalVisitors = blogAnalytics.length;
    const identifiedCompanies = new Set([
      ...leadScores.map(ls => ls.company_domain),
      ...companyValuations.map(cv => cv.company_name)
    ].filter(Boolean)).size;

    const totalLeads = contactLeads.length;
    const qualifiedLeads = leadScores.filter(ls => (ls.total_score || 0) >= 70).length;
    const leadConversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;

    const averageLeadScore = leadScores.length > 0 
      ? leadScores.reduce((sum, lead) => sum + (lead.total_score || 0), 0) / leadScores.length
      : 0;

    const totalRevenue = companyValuations.reduce((sum, v) => sum + (v.final_valuation || 0), 0);

    // Métricas de contenido
    const totalViews = blogPostMetrics.reduce((sum, post) => sum + (post.total_views || 0), 0);
    const averageReadingTime = blogPostMetrics.length > 0 
      ? Math.round(blogPostMetrics.reduce((sum, post) => sum + (post.avg_reading_time || 0), 0) / blogPostMetrics.length)
      : 0;

    // Lead scoring analytics
    const hotLeads = leadScores.filter(s => (s.total_score || 0) >= 80).length;
    const mediumLeads = leadScores.filter(s => (s.total_score || 0) >= 50 && (s.total_score || 0) < 80).length;
    const coldLeads = leadScores.filter(s => (s.total_score || 0) < 50).length;

    const totalEvents = leadBehavior.length;
    const conversionEvents = leadBehavior.filter(e => 
      e.event_type === 'form_submit' || e.event_type === 'download'
    ).length;
    const conversionRate = totalEvents > 0 ? (conversionEvents / totalEvents) * 100 : 0;

    return {
      totalVisitors,
      identifiedCompanies,
      totalLeads,
      qualifiedLeads,
      leadConversionRate,
      averageLeadScore: Math.round(averageLeadScore),
      totalRevenue: Math.round(totalRevenue),
      contentMetrics: {
        totalViews,
        totalPosts: blogPostMetrics.length,
        averageReadingTime,
        topContent: blogPostMetrics.slice(0, 3).map(p => p.post_slug || 'N/A')
      },
      leadScoring: {
        hotLeads,
        mediumLeads,
        coldLeads,
        totalEvents,
        conversionRate: Math.round(conversionRate * 100) / 100
      }
    };
  }, [rawData]);

  return {
    metrics: optimizedMetrics,
    isLoading,
    error,
    rawData
  };
};
