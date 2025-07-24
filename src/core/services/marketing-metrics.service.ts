// ============= MARKETING METRICS SERVICE =============
// Servicio para calcular métricas de marketing

import type { MarketingMetrics } from '@/core/types';

interface RawMarketingData {
  contactLeads: any[];
  leadScores: any[];
  companyValuations: any[];
  blogAnalytics: any[];
  blogPostMetrics: any[];
  leadBehavior: any[];
}

export class MarketingMetricsService {
  
  calculateMetrics(rawData: RawMarketingData): MarketingMetrics {
    const {
      contactLeads,
      leadScores,
      companyValuations,
      blogAnalytics,
      blogPostMetrics,
      leadBehavior
    } = rawData;

    // Calcular métricas básicas
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
    const contentMetrics = this.calculateContentMetrics(blogPostMetrics);
    
    // Lead scoring analytics
    const leadScoring = this.calculateLeadScoringMetrics(leadScores, leadBehavior);

    return {
      totalVisitors,
      identifiedCompanies,
      totalLeads,
      qualifiedLeads,
      leadConversionRate,
      averageLeadScore: Math.round(averageLeadScore),
      totalRevenue: Math.round(totalRevenue),
      contentMetrics,
      leadScoring
    };
  }

  private calculateContentMetrics(blogPostMetrics: any[]) {
    const totalViews = blogPostMetrics.reduce((sum, post) => sum + (post.total_views || 0), 0);
    const averageReadingTime = blogPostMetrics.length > 0 
      ? Math.round(blogPostMetrics.reduce((sum, post) => sum + (post.avg_reading_time || 0), 0) / blogPostMetrics.length)
      : 0;

    return {
      totalViews,
      totalPosts: blogPostMetrics.length,
      averageReadingTime,
      topContent: blogPostMetrics.slice(0, 3).map(p => p.post_slug || 'N/A')
    };
  }

  private calculateLeadScoringMetrics(leadScores: any[], leadBehavior: any[]) {
    const hotLeads = leadScores.filter(s => (s.total_score || 0) >= 80).length;
    const mediumLeads = leadScores.filter(s => (s.total_score || 0) >= 50 && (s.total_score || 0) < 80).length;
    const coldLeads = leadScores.filter(s => (s.total_score || 0) < 50).length;

    const totalEvents = leadBehavior.length;
    const conversionEvents = leadBehavior.filter(e => 
      e.event_type === 'form_submit' || e.event_type === 'download'
    ).length;
    const conversionRate = totalEvents > 0 ? (conversionEvents / totalEvents) * 100 : 0;

    return {
      hotLeads,
      mediumLeads,
      coldLeads,
      totalEvents,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }
}

// Singleton instance
export const marketingMetricsService = new MarketingMetricsService();