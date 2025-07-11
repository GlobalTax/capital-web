
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketingMetrics } from '@/types/marketingHub';

export const useMarketingHub = () => {
  const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetrics>({
    totalVisitors: 0,
    companyVisitors: 0,
    identifiedCompanies: 0,
    totalLeads: 0,
    qualifiedLeads: 0,
    leadConversionRate: 0,
    downloadCount: 0,
    topPerformingContent: [],
    contentToLeadRate: 0,
    averageLeadScore: 0,
    hotProspects: 0,
    emailOpenRate: 0,
    emailClickRate: 0,
    sequenceCompletionRate: 0,
    totalBlogPosts: 0,
    publishedPosts: 0,
    averageReadingTime: 0,
    totalViews: 0,
    totalRevenue: 0
  });

  const [contentPerformance, setContentPerformance] = useState<any[]>([]);
  const [leadScoringAnalytics, setLeadScoringAnalytics] = useState<any>({
    scoreDistribution: { cold: 0, warm: 0, hot: 0 },
    averageScoreByIndustry: {},
    scoringTrends: []
  });
  const [emailMetrics, setEmailMetrics] = useState<any>({
    campaigns: [],
    sequences: []
  });
  const [roiAnalytics, setRoiAnalytics] = useState<any>({
    totalInvestment: 0,
    totalRevenue: 0,
    overallROI: 0,
    channelROI: [],
    monthlyROI: []
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const fetchMarketingMetrics = async () => {
    try {
      // Obtener datos de leads totales
      const { data: contactLeads, error: leadsError } = await supabase
        .from('contact_leads')
        .select('*');

      const { data: companyValuations, error: valuationsError } = await supabase
        .from('company_valuations')
        .select('*');

      const { data: leadScores, error: scoresError } = await supabase
        .from('lead_scores')
        .select('*');

      const { data: blogPosts, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true);

      const { data: blogAnalytics, error: analyticsError } = await supabase
        .from('blog_analytics')
        .select('*');

      if (leadsError || valuationsError || scoresError || postsError || analyticsError) {
        console.error('Error fetching marketing data:', { 
          leadsError, valuationsError, scoresError, postsError, analyticsError 
        });
        return;
      }

      const totalLeads = (contactLeads?.length || 0) + (companyValuations?.length || 0);
      const qualifiedLeads = contactLeads?.filter(lead => lead.status !== 'new').length || 0;
      const totalVisitors = blogAnalytics?.length || 0;
      const averageScore = leadScores?.length > 0 
        ? Math.round(leadScores.reduce((sum, score) => sum + (score.total_score || 0), 0) / leadScores.length)
        : 0;
      const hotProspects = leadScores?.filter(score => (score.total_score || 0) > 80).length || 0;

      // Top performing content basado en blog posts más populares
      const topContent = blogPosts?.slice(0, 3).map(post => post.title) || [];

      setMarketingMetrics({
        totalVisitors,
        companyVisitors: Math.round(totalVisitors * 0.25), // Estimación: 25% de visitantes son empresas
        identifiedCompanies: leadScores?.filter(score => score.company_domain).length || 0,
        totalLeads,
        qualifiedLeads,
        leadConversionRate: totalVisitors > 0 ? Math.round((totalLeads / totalVisitors) * 100 * 10) / 10 : 0,
        downloadCount: Math.round(totalLeads * 0.3), // Estimación: 30% de leads son por descarga
        topPerformingContent: topContent,
        contentToLeadRate: blogPosts?.length > 0 ? Math.round((totalLeads / blogPosts.length) * 10) / 10 : 0,
        averageLeadScore: averageScore,
        hotProspects,
        emailOpenRate: 78.5, // Datos que mantendremos simulados por ahora
        emailClickRate: 12.3,
        sequenceCompletionRate: 65.4,
        totalBlogPosts: blogPosts?.length || 0,
        publishedPosts: blogPosts?.filter(post => post.is_published).length || 0,
        averageReadingTime: blogPosts?.length > 0 ? Math.round(blogPosts.reduce((sum, post) => sum + (post.reading_time || 0), 0) / blogPosts.length) : 0,
        totalViews: blogAnalytics?.reduce((sum, analytics) => sum + (analytics.scroll_percentage || 0), 0) || 0,
        totalRevenue: Math.round(totalLeads * 2500) // Estimación: €2,500 por lead
      });

    } catch (error) {
      console.error('Error en fetchMarketingMetrics:', error);
    }
  };

  const fetchContentPerformance = async () => {
    try {
      const { data: blogPosts, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          category,
          created_at,
          blog_post_metrics (
            total_views,
            unique_views,
            avg_reading_time,
            avg_scroll_percentage
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) {
        console.error('Error fetching content performance:', postsError);
        return;
      }

      const formattedContent = blogPosts?.map(post => {
        const metrics = Array.isArray(post.blog_post_metrics) ? post.blog_post_metrics[0] : post.blog_post_metrics;
        const totalViews = metrics?.total_views || 0;
        
        return {
          id: post.id,
          title: post.title,
          type: 'blog' as const,
          views: totalViews,
          downloads: Math.round(totalViews * 0.05), // 5% estimado
          leads_generated: Math.round(totalViews * 0.02), // 2% estimado
          conversion_rate: totalViews > 0 
            ? Math.round((totalViews * 0.02 / totalViews) * 100 * 10) / 10
            : 0,
          engagement_score: metrics?.avg_scroll_percentage || 0
        };
      }) || [];

      setContentPerformance(formattedContent);
    } catch (error) {
      console.error('Error en fetchContentPerformance:', error);
    }
  };

  const fetchLeadScoringAnalytics = async () => {
    try {
      const { data: leadScores, error } = await supabase
        .from('lead_scores')
        .select('*');

      if (error) {
        console.error('Error fetching lead scoring analytics:', error);
        return;
      }

      const coldLeads = leadScores?.filter(score => (score.total_score || 0) <= 40).length || 0;
      const warmLeads = leadScores?.filter(score => (score.total_score || 0) > 40 && (score.total_score || 0) <= 70).length || 0;
      const hotLeads = leadScores?.filter(score => (score.total_score || 0) > 70).length || 0;

      // Agrupar por industria
      const industryScores: Record<string, number[]> = {};
      leadScores?.forEach(score => {
        if (score.industry && score.total_score) {
          if (!industryScores[score.industry]) {
            industryScores[score.industry] = [];
          }
          industryScores[score.industry].push(score.total_score);
        }
      });

      const averageScoreByIndustry: Record<string, number> = {};
      Object.keys(industryScores).forEach(industry => {
        const scores = industryScores[industry];
        averageScoreByIndustry[industry] = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );
      });

      // Tendencias de los últimos 30 días (simulado por ahora)
      const scoringTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        average_score: Math.floor(Math.random() * 20) + 60,
        hot_leads: Math.floor(Math.random() * 10) + 5
      }));

      setLeadScoringAnalytics({
        scoreDistribution: {
          cold: coldLeads,
          warm: warmLeads,
          hot: hotLeads
        },
        averageScoreByIndustry,
        scoringTrends
      });
    } catch (error) {
      console.error('Error en fetchLeadScoringAnalytics:', error);
    }
  };

  const fetchROIAnalytics = async () => {
    try {
      const { data: valuations, error } = await supabase
        .from('company_valuations')
        .select('final_valuation, created_at');

      if (error) {
        console.error('Error fetching ROI analytics:', error);
        return;
      }

      const totalRevenue = valuations?.reduce((sum, val) => sum + (val.final_valuation || 0), 0) || 0;
      const estimatedInvestment = totalRevenue * 0.15; // Estimación: 15% de inversión respecto a ingresos

      setRoiAnalytics({
        totalInvestment: Math.round(estimatedInvestment),
        totalRevenue: Math.round(totalRevenue),
        overallROI: estimatedInvestment > 0 ? Math.round(((totalRevenue - estimatedInvestment) / estimatedInvestment) * 100) : 0,
        channelROI: [
          {
            channel: 'Valoraciones',
            investment: Math.round(estimatedInvestment * 0.6),
            revenue: Math.round(totalRevenue * 0.7),
            roi: 400,
            leads: valuations?.length || 0,
            cost_per_lead: valuations?.length > 0 ? Math.round((estimatedInvestment * 0.6) / valuations.length) : 0
          },
          {
            channel: 'Content Marketing',
            investment: Math.round(estimatedInvestment * 0.4),
            revenue: Math.round(totalRevenue * 0.3),
            roi: 250,
            leads: Math.round((valuations?.length || 0) * 0.3),
            cost_per_lead: 45
          }
        ],
        monthlyROI: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const investment = Math.floor(Math.random() * 5000) + 8000;
          const revenue = investment * (Math.random() * 3 + 2);
          
          return {
            month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            investment,
            revenue: Math.floor(revenue),
            roi: Math.round(((revenue - investment) / investment) * 100)
          };
        })
      });
    } catch (error) {
      console.error('Error en fetchROIAnalytics:', error);
    }
  };

  const fetchAllData = useCallback(async () => {
    setIsLoadingMetrics(true);
    await Promise.all([
      fetchMarketingMetrics(),
      fetchContentPerformance(),
      fetchLeadScoringAnalytics(),
      fetchROIAnalytics()
    ]);
    setIsLoadingMetrics(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    // Data
    marketingMetrics,
    contentPerformance,
    leadScoringAnalytics,
    emailMetrics,
    roiAnalytics,
    
    // Loading states
    isLoadingMetrics,
    
    // Refresh function
    refetchAll: fetchAllData
  };
};
