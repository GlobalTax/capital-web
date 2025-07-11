import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MarketingMetrics } from '@/types/marketingHub';
import { usePrefetch } from './usePrefetch';

// Hook mejorado para el Marketing Hub con caching inteligente y prefetching
export const useMarketingHubEnhanced = () => {
  const { prefetchMarketingData } = usePrefetch();

  // Métricas principales con cache agresivo
  const {
    data: marketingMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useQuery({
    queryKey: ['marketing_metrics_enhanced'],
    queryFn: async (): Promise<MarketingMetrics> => {
      // Ejecutar consultas en paralelo para máximo rendimiento
      const [
        contactLeadsRes,
        leadScoresRes,
        companyValuationsRes,
        blogAnalyticsRes,
        blogPostMetricsRes
      ] = await Promise.all([
        supabase
          .from('contact_leads')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('lead_scores')
          .select('*')
          .order('total_score', { ascending: false }),
        supabase
          .from('company_valuations')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('blog_analytics')
          .select('*')
          .order('viewed_at', { ascending: false }),
        supabase
          .from('blog_post_metrics')
          .select('*')
          .order('total_views', { ascending: false })
      ]);

      const contactLeads = contactLeadsRes.data || [];
      const leadScores = leadScoresRes.data || [];
      const companyValuations = companyValuationsRes.data || [];
      const blogAnalytics = blogAnalyticsRes.data || [];
      const blogPostMetrics = blogPostMetricsRes.data || [];

      // Calcular métricas avanzadas
      const totalVisitors = blogAnalytics.length;
      const identifiedCompanies = new Set(
        [...leadScores.map(ls => ls.company_domain), ...companyValuations.map(cv => cv.company_name)]
          .filter(Boolean)
      ).size;

      const totalLeads = contactLeads.length;
      const qualifiedLeads = leadScores.filter(ls => (ls.total_score || 0) >= 70).length;
      
      const leadConversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
      
      const downloadCount = blogPostMetrics.reduce((sum, post) => 
        sum + (post.total_views || 0), 0
      );
      
      const averageLeadScore = leadScores.length > 0 
        ? leadScores.reduce((sum, lead) => sum + (lead.total_score || 0), 0) / leadScores.length
        : 0;

      // Simulación de email open rate (integraría con servicio real)
      const emailOpenRate = 24.5;

      return {
        totalVisitors,
        identifiedCompanies,
        totalLeads,
        qualifiedLeads,
        leadConversionRate,
        downloadCount,
        averageLeadScore: Math.round(averageLeadScore),
        emailOpenRate,
        emailClickRate: 3.8,
        sequenceCompletionRate: 65.2,
        companyVisitors: identifiedCompanies,
        topPerformingContent: blogPostMetrics.slice(0,3).map(p => p.post_slug || 'N/A'),
        contentToLeadRate: downloadCount > 0 ? (totalLeads / downloadCount) * 100 : 0,
        hotProspects: qualifiedLeads,
        totalBlogPosts: blogPostMetrics.length,
        publishedPosts: blogPostMetrics.length, // Asumimos que todos están publicados
        averageReadingTime: blogPostMetrics.length > 0 ? 
          Math.round(blogPostMetrics.reduce((sum, post) => sum + (post.avg_reading_time || 0), 0) / blogPostMetrics.length) : 0,
        totalViews: blogPostMetrics.reduce((sum, post) => sum + (post.total_views || 0), 0),
        totalRevenue: Math.round(totalLeads * 2500) // Estimación: €2,500 por lead
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos en cache
    refetchInterval: 5 * 60 * 1000 // Refetch cada 5 minutos
  });

  // Content Performance con agregaciones optimizadas
  const {
    data: contentPerformance,
    isLoading: isLoadingContent
  } = useQuery({
    queryKey: ['content_performance_enhanced'],
    queryFn: async () => {
      const [postsRes, metricsRes, analyticsRes] = await Promise.all([
        supabase.from('blog_posts').select('*'),
        supabase.from('blog_post_metrics').select('*'),
        supabase.from('blog_analytics').select('*')
      ]);

      const posts = postsRes.data || [];
      const metrics = metricsRes.data || [];
      const analytics = analyticsRes.data || [];

      return posts.map(post => {
        const postMetrics = metrics.find(m => m.post_id === post.id);
        const postAnalytics = analytics.filter(a => a.post_id === post.id);

        return {
          id: post.id,
          title: post.title,
          type: 'blog_post',
          views: postMetrics?.total_views || 0,
          uniqueViews: postMetrics?.unique_views || 0,
          downloads: postAnalytics.length, // Aproximación
          engagement: postMetrics?.avg_scroll_percentage || 0,
          leads: 0, // Se calcularía con datos adicionales
          category: post.category,
          publishedAt: post.published_at,
          readingTime: postMetrics?.avg_reading_time || 0
        };
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  });

  // Lead Scoring Analytics
  const {
    data: leadScoringAnalytics,
    isLoading: isLoadingLeadScoring
  } = useQuery({
    queryKey: ['lead_scoring_analytics_enhanced'],
    queryFn: async () => {
      const [scoresRes, alertsRes, eventsRes] = await Promise.all([
        supabase.from('lead_scores').select('*').order('total_score', { ascending: false }),
        supabase.from('lead_alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('lead_behavior_events').select('*').order('created_at', { ascending: false }).limit(1000)
      ]);

      const scores = scoresRes.data || [];
      const alerts = alertsRes.data || [];
      const events = eventsRes.data || [];

      const hotLeads = scores.filter(s => (s.total_score || 0) >= 80);
      const mediumLeads = scores.filter(s => (s.total_score || 0) >= 50 && (s.total_score || 0) < 80);
      const coldLeads = scores.filter(s => (s.total_score || 0) < 50);

      const averageScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + (s.total_score || 0), 0) / scores.length 
        : 0;

      const totalEvents = events.length;
      const conversionEvents = events.filter(e => e.event_type === 'form_submit' || e.event_type === 'download').length;
      const conversionRate = totalEvents > 0 ? (conversionEvents / totalEvents) * 100 : 0;

      return {
        totalLeads: scores.length,
        hotLeads: hotLeads.length,
        mediumLeads: mediumLeads.length,
        coldLeads: coldLeads.length,
        averageScore: Math.round(averageScore),
        conversionRate: Math.round(conversionRate * 100) / 100,
        activeAlerts: alerts.filter(a => !a.is_read).length,
        totalEvents,
        topLeads: hotLeads.slice(0, 10)
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minuto para datos más críticos
    gcTime: 5 * 60 * 1000
  });

  // Email Marketing Metrics (simulado - se integraría con servicio real)
  const {
    data: emailMetrics,
    isLoading: isLoadingEmail
  } = useQuery({
    queryKey: ['email_metrics_enhanced'],
    queryFn: async () => {
      // Simulación basada en leads reales
      const leadsRes = await supabase.from('contact_leads').select('*');
      const leads = leadsRes.data || [];

      return {
        totalSent: leads.length * 3, // Simulación: 3 emails por lead
        openRate: 24.5,
        clickRate: 3.8,
        unsubscribeRate: 0.5,
        bounceRate: 2.1,
        deliveryRate: 97.9,
        totalSubscribers: leads.length,
        activeSubscribers: Math.round(leads.length * 0.85),
        recentCampaigns: [
          {
            name: 'Newsletter Mensual',
            sent: leads.length,
            opened: Math.round(leads.length * 0.245),
            clicked: Math.round(leads.length * 0.038),
            date: new Date().toISOString()
          }
        ]
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    gcTime: 30 * 60 * 1000
  });

  // ROI Analytics con cálculos avanzados
  const {
    data: roiAnalytics,
    isLoading: isLoadingROI
  } = useQuery({
    queryKey: ['roi_analytics_enhanced'],
    queryFn: async () => {
      const [leadsRes, valuationsRes] = await Promise.all([
        supabase.from('contact_leads').select('*'),
        supabase.from('company_valuations').select('*')
      ]);

      const leads = leadsRes.data || [];
      const valuations = valuationsRes.data || [];

      // Cálculos de ROI basados en datos reales
      const totalRevenue = valuations.reduce((sum, v) => sum + (v.final_valuation || 0), 0);
      const estimatedMarketingCost = leads.length * 50; // Estimación: €50 por lead
      const roi = estimatedMarketingCost > 0 ? ((totalRevenue - estimatedMarketingCost) / estimatedMarketingCost) * 100 : 0;

      const cac = leads.length > 0 ? estimatedMarketingCost / leads.length : 0;
      const ltv = totalRevenue / Math.max(leads.length, 1); // Lifetime Value aproximado

      return {
        totalRevenue: Math.round(totalRevenue),
        marketingCost: estimatedMarketingCost,
        roi: Math.round(roi * 100) / 100,
        cac: Math.round(cac * 100) / 100,
        ltv: Math.round(ltv * 100) / 100,
        ltvCacRatio: cac > 0 ? Math.round((ltv / cac) * 100) / 100 : 0,
        conversionValue: totalRevenue,
        campaigns: [
          {
            name: 'Calculadora de Valoración',
            cost: estimatedMarketingCost * 0.4,
            revenue: totalRevenue * 0.6,
            roi: roi * 0.6
          },
          {
            name: 'Contenido Orgánico',
            cost: estimatedMarketingCost * 0.3,
            revenue: totalRevenue * 0.25,
            roi: roi * 0.25
          },
          {
            name: 'Lead Magnets',
            cost: estimatedMarketingCost * 0.3,
            revenue: totalRevenue * 0.15,
            roi: roi * 0.15
          }
        ]
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000
  });

  // Estado de loading global
  const isLoading = isLoadingMetrics || isLoadingContent || isLoadingLeadScoring || isLoadingEmail || isLoadingROI;

  // Manejo de errores
  const hasError = Boolean(metricsError);

  return {
    marketingMetrics,
    contentPerformance,
    leadScoringAnalytics,
    emailMetrics,
    roiAnalytics,
    isLoading,
    isLoadingMetrics,
    isLoadingContent,
    isLoadingLeadScoring,
    isLoadingEmail,
    isLoadingROI,
    hasError,
    error: metricsError
  };
};