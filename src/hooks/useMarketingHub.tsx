
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { MarketingMetrics, ContentPerformance, LeadScoringAnalytics, EmailMarketingMetrics, ROIAnalytics } from '@/types/marketingHub';

export const useMarketingHub = () => {
  // Obtener métricas principales
  const { data: marketingMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['marketingMetrics'],
    queryFn: async (): Promise<MarketingMetrics> => {
      // Traffic Intelligence
      const { data: leadScores } = await supabase
        .from('lead_scores')
        .select('*');

      const { data: behaviorEvents } = await supabase
        .from('lead_behavior_events')
        .select('*');

      // Content Performance
      const { data: leadMagnets } = await supabase
        .from('lead_magnets')
        .select('*');

      const { data: downloads } = await supabase
        .from('lead_magnet_downloads')
        .select('*');

      // Email Marketing
      const { data: scheduledEmails } = await supabase
        .from('scheduled_emails')
        .select('*');

      const totalVisitors = new Set(behaviorEvents?.map(e => e.visitor_id) || []).size;
      const companyVisitors = leadScores?.filter(ls => ls.company_domain)?.length || 0;
      const identifiedCompanies = new Set(leadScores?.map(ls => ls.company_domain).filter(Boolean) || []).size;
      
      const totalLeads = leadScores?.length || 0;
      const qualifiedLeads = leadScores?.filter(ls => ls.total_score >= 50)?.length || 0;
      const leadConversionRate = totalVisitors > 0 ? (totalLeads / totalVisitors) * 100 : 0;
      
      const downloadCount = downloads?.length || 0;
      const hotProspects = leadScores?.filter(ls => ls.total_score > 80)?.length || 0;
      const averageLeadScore = leadScores?.length ? 
        leadScores.reduce((sum, ls) => sum + ls.total_score, 0) / leadScores.length : 0;

      // Top performing content (simulado)
      const topPerformingContent = leadMagnets?.slice(0, 5).map(lm => lm.title) || [];

      // Email metrics (simulado)
      const emailsSent = scheduledEmails?.filter(e => e.status === 'sent')?.length || 0;
      const emailsOpened = scheduledEmails?.filter(e => e.opened_at)?.length || 0;
      const emailsClicked = scheduledEmails?.filter(e => e.clicked_at)?.length || 0;
      
      const emailOpenRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
      const emailClickRate = emailsOpened > 0 ? (emailsClicked / emailsOpened) * 100 : 0;

      return {
        totalVisitors,
        companyVisitors,
        identifiedCompanies,
        totalLeads,
        qualifiedLeads,
        leadConversionRate,
        downloadCount,
        topPerformingContent,
        contentToLeadRate: downloadCount > 0 ? (totalLeads / downloadCount) * 100 : 0,
        averageLeadScore: Math.round(averageLeadScore),
        hotProspects,
        emailOpenRate: Math.round(emailOpenRate * 100) / 100,
        emailClickRate: Math.round(emailClickRate * 100) / 100,
        sequenceCompletionRate: 65.4 // Simulado por ahora
      };
    },
    refetchInterval: 60000, // Actualizar cada minuto
  });

  // Obtener análisis de contenido
  const { data: contentPerformance } = useQuery({
    queryKey: ['contentPerformance'],
    queryFn: async (): Promise<ContentPerformance[]> => {
      const { data: leadMagnets } = await supabase
        .from('lead_magnets')
        .select(`
          *,
          lead_magnet_downloads(count)
        `);

      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true);

      const content: ContentPerformance[] = [];

      // Lead Magnets
      leadMagnets?.forEach(lm => {
        content.push({
          id: lm.id,
          title: lm.title,
          type: 'lead_magnet',
          views: Math.floor(Math.random() * 1000) + 100, // Simulado
          downloads: lm.download_count,
          leads_generated: lm.lead_conversion_count,
          conversion_rate: lm.download_count > 0 ? (lm.lead_conversion_count / lm.download_count) * 100 : 0,
          engagement_score: Math.floor(Math.random() * 100)
        });
      });

      // Blog Posts
      blogPosts?.forEach(bp => {
        content.push({
          id: bp.id,
          title: bp.title,
          type: 'blog',
          views: Math.floor(Math.random() * 2000) + 200,
          downloads: 0,
          leads_generated: Math.floor(Math.random() * 10),
          conversion_rate: Math.random() * 5, // 0-5%
          engagement_score: Math.floor(Math.random() * 100)
        });
      });

      return content.sort((a, b) => b.leads_generated - a.leads_generated);
    },
  });

  // Obtener análisis de lead scoring
  const { data: leadScoringAnalytics } = useQuery({
    queryKey: ['leadScoringAnalytics'],
    queryFn: async (): Promise<LeadScoringAnalytics> => {
      const { data: leadScores } = await supabase
        .from('lead_scores')
        .select('*');

      const scoreDistribution = {
        cold: leadScores?.filter(ls => ls.total_score <= 40)?.length || 0,
        warm: leadScores?.filter(ls => ls.total_score > 40 && ls.total_score <= 70)?.length || 0,
        hot: leadScores?.filter(ls => ls.total_score > 70)?.length || 0,
      };

      // Promedio por industria
      const averageScoreByIndustry: Record<string, number> = {};
      const industriesMap: Record<string, number[]> = {};

      leadScores?.forEach(ls => {
        if (ls.industry) {
          if (!industriesMap[ls.industry]) {
            industriesMap[ls.industry] = [];
          }
          industriesMap[ls.industry].push(ls.total_score);
        }
      });

      Object.keys(industriesMap).forEach(industry => {
        const scores = industriesMap[industry];
        averageScoreByIndustry[industry] = Math.round(
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );
      });

      // Tendencias (últimos 30 días simuladas)
      const scoringTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          average_score: Math.floor(Math.random() * 20) + 50,
          hot_leads: Math.floor(Math.random() * 10) + 5
        };
      });

      return {
        scoreDistribution,
        averageScoreByIndustry,
        scoringTrends
      };
    },
  });

  // Obtener métricas de email marketing
  const { data: emailMetrics } = useQuery({
    queryKey: ['emailMetrics'],
    queryFn: async (): Promise<EmailMarketingMetrics> => {
      const { data: sequences } = await supabase
        .from('email_sequences')
        .select('*');

      const { data: scheduledEmails } = await supabase
        .from('scheduled_emails')
        .select('*');

      // Simulando campañas de email
      const campaigns = [
        {
          id: '1',
          name: 'Bienvenida Lead Magnets',
          sent: 245,
          opened: 182,
          clicked: 47,
          converted: 12,
          open_rate: 74.3,
          click_rate: 25.8,
          conversion_rate: 4.9,
          roi: 320
        },
        {
          id: '2',
          name: 'Nurturing Sector Tecnología',
          sent: 156,
          opened: 124,
          clicked: 31,
          converted: 8,
          open_rate: 79.5,
          click_rate: 25.0,
          conversion_rate: 5.1,
          roi: 280
        }
      ];

      const sequenceMetrics = sequences?.map(seq => ({
        id: seq.id,
        name: seq.name,
        total_enrolled: Math.floor(Math.random() * 100) + 50,
        completed: Math.floor(Math.random() * 50) + 25,
        completion_rate: Math.random() * 40 + 60, // 60-100%
        avg_open_rate: Math.random() * 30 + 70, // 70-100%
        avg_click_rate: Math.random() * 20 + 20 // 20-40%
      })) || [];

      return {
        campaigns,
        sequences: sequenceMetrics
      };
    },
  });

  // Obtener análisis de ROI
  const { data: roiAnalytics } = useQuery({
    queryKey: ['roiAnalytics'],
    queryFn: async (): Promise<ROIAnalytics> => {
      // Simulando datos de ROI
      const channelROI = [
        {
          channel: 'Content Marketing',
          investment: 5000,
          revenue: 25000,
          roi: 400,
          leads: 125,
          cost_per_lead: 40
        },
        {
          channel: 'Email Marketing',
          investment: 2000,
          revenue: 15000,
          roi: 650,
          leads: 85,
          cost_per_lead: 23.5
        },
        {
          channel: 'SEO Orgánico',
          investment: 3000,
          revenue: 18000,
          roi: 500,
          leads: 95,
          cost_per_lead: 31.6
        },
        {
          channel: 'Lead Magnets',
          investment: 1500,
          revenue: 12000,
          roi: 700,
          leads: 78,
          cost_per_lead: 19.2
        }
      ];

      const totalInvestment = channelROI.reduce((sum, ch) => sum + ch.investment, 0);
      const totalRevenue = channelROI.reduce((sum, ch) => sum + ch.revenue, 0);
      const overallROI = ((totalRevenue - totalInvestment) / totalInvestment) * 100;

      // ROI mensual (últimos 12 meses)
      const monthlyROI = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const investment = Math.floor(Math.random() * 5000) + 8000;
        const revenue = investment * (Math.random() * 3 + 2); // ROI entre 200-500%
        
        return {
          month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          investment,
          revenue: Math.floor(revenue),
          roi: Math.round(((revenue - investment) / investment) * 100)
        };
      });

      return {
        totalInvestment,
        totalRevenue,
        overallROI: Math.round(overallROI),
        channelROI,
        monthlyROI
      };
    },
  });

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
    refetchAll: useCallback(() => {
      // Invalidar todas las queries para refrescar datos
    }, [])
  };
};
