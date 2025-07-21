
import { supabase } from '@/integrations/supabase/client';
import { MarketingMetrics } from '@/types/marketingHub';
import { useOptimizedQuery } from './useOptimizedQuery';
import { usePrefetch } from './usePrefetch';

// Hook mejorado para el Marketing Hub con optimizaciones avanzadas
export const useMarketingHubEnhanced = () => {
  const { prefetchMarketingData } = usePrefetch();

  // Métricas principales optimizadas con select
  const {
    data: marketingMetrics,
    isLoading: isLoadingMetrics,
    error: metricsError
  } = useOptimizedQuery(
    ['marketing_metrics_enhanced'],
    async (): Promise<MarketingMetrics> => {
      // Ejecutar consultas en paralelo con select optimizado
      const [
        contactLeadsRes,
        leadScoresRes,
        companyValuationsRes,
        blogAnalyticsRes,
        blogPostMetricsRes
      ] = await Promise.all([
        supabase
          .from('contact_leads')
          .select('id, created_at, status')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('lead_scores')
          .select('id, total_score, company_domain, visitor_id')
          .order('total_score', { ascending: false })
          .limit(1000),
        supabase
          .from('company_valuations')
          .select('id, company_name, final_valuation, created_at')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase
          .from('blog_analytics')
          .select('id, post_id, viewed_at, visitor_id')
          .order('viewed_at', { ascending: false })
          .limit(5000),
        supabase
          .from('blog_post_metrics')
          .select('post_slug, total_views, avg_reading_time')
          .order('total_views', { ascending: false })
          .limit(100)
      ]);

      const contactLeads = contactLeadsRes.data || [];
      const leadScores = leadScoresRes.data || [];
      const companyValuations = companyValuationsRes.data || [];
      const blogAnalytics = blogAnalyticsRes.data || [];
      const blogPostMetrics = blogPostMetricsRes.data || [];

      // Calcular métricas optimizadas
      const totalVisitors = new Set(blogAnalytics.map(b => b.visitor_id)).size;
      const identifiedCompanies = new Set([
        ...leadScores.map(ls => ls.company_domain),
        ...companyValuations.map(cv => cv.company_name)
      ].filter(Boolean)).size;

      const totalLeads = contactLeads.length;
      const qualifiedLeads = leadScores.filter(ls => (ls.total_score || 0) >= 70).length;
      
      const leadConversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
      
      const downloadCount = blogPostMetrics.reduce((sum, post) => 
        sum + (post.total_views || 0), 0
      );
      
      const averageLeadScore = leadScores.length > 0 
        ? leadScores.reduce((sum, lead) => sum + (lead.total_score || 0), 0) / leadScores.length
        : 0;

      const totalRevenue = companyValuations.reduce((sum, v) => sum + (v.final_valuation || 0), 0);

      return {
        totalVisitors,
        identifiedCompanies,
        totalLeads,
        qualifiedLeads,
        leadConversionRate,
        downloadCount,
        averageLeadScore: Math.round(averageLeadScore),
        emailOpenRate: 24.5,
        emailClickRate: 3.8,
        sequenceCompletionRate: 65.2,
        companyVisitors: identifiedCompanies,
        topPerformingContent: blogPostMetrics.slice(0,3).map(p => p.post_slug || 'N/A'),
        contentToLeadRate: downloadCount > 0 ? (totalLeads / downloadCount) * 100 : 0,
        hotProspects: qualifiedLeads,
        totalBlogPosts: blogPostMetrics.length,
        publishedPosts: blogPostMetrics.length,
        averageReadingTime: blogPostMetrics.length > 0 ? 
          Math.round(blogPostMetrics.reduce((sum, post) => sum + (post.avg_reading_time || 0), 0) / blogPostMetrics.length) : 0,
        totalViews: blogPostMetrics.reduce((sum, post) => sum + (post.total_views || 0), 0),
        totalRevenue: Math.round(totalRevenue)
      };
    },
    'important',
    {
      placeholderData: {
        totalVisitors: 0,
        identifiedCompanies: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
        leadConversionRate: 0,
        downloadCount: 0,
        averageLeadScore: 0,
        emailOpenRate: 0,
        emailClickRate: 0,
        sequenceCompletionRate: 0,
        companyVisitors: 0,
        topPerformingContent: [],
        contentToLeadRate: 0,
        hotProspects: 0,
        totalBlogPosts: 0,
        publishedPosts: 0,
        averageReadingTime: 0,
        totalViews: 0,
        totalRevenue: 0
      },
      // Prefetch automático en background
      onSuccess: () => {
        setTimeout(prefetchMarketingData, 1000);
      }
    }
  );

  // Content Performance optimizado
  const {
    data: contentPerformance,
    isLoading: isLoadingContent
  } = useOptimizedQuery(
    ['content_performance_enhanced'],
    async () => {
      const [postsRes, metricsRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('id, title, category, published_at')
          .eq('is_published', true)
          .limit(50),
        supabase
          .from('blog_post_metrics')
          .select('post_id, total_views, unique_views, avg_scroll_percentage, avg_reading_time')
          .limit(50)
      ]);

      const posts = postsRes.data || [];
      const metrics = metricsRes.data || [];

      return posts.map(post => {
        const postMetrics = metrics.find(m => m.post_id === post.id);
        return {
          id: post.id,
          title: post.title,
          type: 'blog_post',
          views: postMetrics?.total_views || 0,
          uniqueViews: postMetrics?.unique_views || 0,
          downloads: 0,
          engagement: postMetrics?.avg_scroll_percentage || 0,
          leads: 0,
          category: post.category,
          publishedAt: post.published_at,
          readingTime: postMetrics?.avg_reading_time || 0
        };
      });
    },
    'important',
    {
      placeholderData: [],
      select: (data) => data?.slice(0, 20) || [] // Limitar resultados para UI
    }
  );

  // Lead Scoring Analytics optimizado
  const {
    data: leadScoringAnalytics,
    isLoading: isLoadingLeadScoring
  } = useOptimizedQuery(
    ['lead_scoring_analytics_enhanced'],
    async () => {
      const [scoresRes, alertsRes] = await Promise.all([
        supabase
          .from('lead_scores')
          .select('id, total_score, visitor_id')
          .order('total_score', { ascending: false })
          .limit(500),
        supabase
          .from('lead_alerts')
          .select('id, is_read, created_at')
          .order('created_at', { ascending: false })
          .limit(100)
      ]);

      const scores = scoresRes.data || [];
      const alerts = alertsRes.data || [];

      const hotLeads = scores.filter(s => (s.total_score || 0) >= 80);
      const mediumLeads = scores.filter(s => (s.total_score || 0) >= 50 && (s.total_score || 0) < 80);
      const coldLeads = scores.filter(s => (s.total_score || 0) < 50);

      const averageScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + (s.total_score || 0), 0) / scores.length 
        : 0;

      return {
        totalLeads: scores.length,
        hotLeads: hotLeads.length,
        mediumLeads: mediumLeads.length,
        coldLeads: coldLeads.length,
        averageScore: Math.round(averageScore),
        conversionRate: 0,
        activeAlerts: alerts.filter(a => !a.is_read).length,
        totalEvents: 0,
        topLeads: hotLeads.slice(0, 10)
      };
    },
    'critical',
    {
      placeholderData: {
        totalLeads: 0,
        hotLeads: 0,
        mediumLeads: 0,
        coldLeads: 0,
        averageScore: 0,
        conversionRate: 0,
        activeAlerts: 0,
        totalEvents: 0,
        topLeads: []
      }
    }
  );

  // Email metrics (simulado) con placeholder
  const {
    data: emailMetrics,
    isLoading: isLoadingEmail
  } = useOptimizedQuery(
    ['email_metrics_enhanced'],
    async () => {
      const leadsRes = await supabase
        .from('contact_leads')
        .select('id, email')
        .limit(100);
      
      const leads = leadsRes.data || [];

      return {
        totalSent: leads.length * 3,
        openRate: 24.5,
        clickRate: 3.8,
        unsubscribeRate: 0.5,
        bounceRate: 2.1,
        deliveryRate: 97.9,
        totalSubscribers: leads.length,
        activeSubscribers: Math.round(leads.length * 0.85),
        recentCampaigns: []
      };
    },
    'static',
    {
      placeholderData: {
        totalSent: 0,
        openRate: 0,
        clickRate: 0,
        unsubscribeRate: 0,
        bounceRate: 0,
        deliveryRate: 0,
        totalSubscribers: 0,
        activeSubscribers: 0,
        recentCampaigns: []
      }
    }
  );

  // ROI Analytics optimizado
  const {
    data: roiAnalytics,
    isLoading: isLoadingROI
  } = useOptimizedQuery(
    ['roi_analytics_enhanced'],
    async () => {
      const [leadsRes, valuationsRes] = await Promise.all([
        supabase
          .from('contact_leads')
          .select('id')
          .limit(100),
        supabase
          .from('company_valuations')
          .select('final_valuation')
          .limit(100)
      ]);

      const leads = leadsRes.data || [];
      const valuations = valuationsRes.data || [];

      const totalRevenue = valuations.reduce((sum, v) => sum + (v.final_valuation || 0), 0);
      const estimatedMarketingCost = leads.length * 50;
      const roi = estimatedMarketingCost > 0 ? ((totalRevenue - estimatedMarketingCost) / estimatedMarketingCost) * 100 : 0;

      return {
        totalRevenue: Math.round(totalRevenue),
        marketingCost: estimatedMarketingCost,
        roi: Math.round(roi * 100) / 100,
        cac: leads.length > 0 ? estimatedMarketingCost / leads.length : 0,
        ltv: totalRevenue / Math.max(leads.length, 1),
        ltvCacRatio: 0,
        conversionValue: totalRevenue,
        campaigns: []
      };
    },
    'important',
    {
      placeholderData: {
        totalRevenue: 0,
        marketingCost: 0,
        roi: 0,
        cac: 0,
        ltv: 0,
        ltvCacRatio: 0,
        conversionValue: 0,
        campaigns: []
      }
    }
  );

  const isLoading = isLoadingMetrics || isLoadingContent || isLoadingLeadScoring || isLoadingEmail || isLoadingROI;

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
    hasError: Boolean(metricsError),
    error: metricsError
  };
};
