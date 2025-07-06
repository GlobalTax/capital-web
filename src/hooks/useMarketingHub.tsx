
import { useState, useCallback } from 'react';
import { MarketingMetrics } from '@/types/marketingHub';

export const useMarketingHub = () => {
  // Datos simulados simplificados
  const marketingMetrics: MarketingMetrics = {
    totalVisitors: 1250,
    companyVisitors: 320,
    identifiedCompanies: 85,
    totalLeads: 156,
    qualifiedLeads: 89,
    leadConversionRate: 12.5,
    downloadCount: 45,
    topPerformingContent: ['Guía de Valoración', 'Análisis Tech 2024', 'Múltiplos Sector Industrial'],
    contentToLeadRate: 24.8,
    averageLeadScore: 72,
    hotProspects: 23,
    emailOpenRate: 78.5,
    emailClickRate: 12.3,
    sequenceCompletionRate: 65.4
  };

  const contentPerformance = [
    {
      id: '1',
      title: 'Guía de Valoración Empresarial',
      type: 'blog' as const,
      views: 850,
      downloads: 45,
      leads_generated: 12,
      conversion_rate: 26.7,
      engagement_score: 85
    },
    {
      id: '2', 
      title: 'Análisis del Sector Tech 2024',
      type: 'blog' as const,
      views: 620,
      downloads: 28,
      leads_generated: 8,
      conversion_rate: 28.6,
      engagement_score: 78
    }
  ];

  const leadScoringAnalytics = {
    scoreDistribution: {
      cold: 45,
      warm: 67,
      hot: 23
    },
    averageScoreByIndustry: {
      'tecnologia': 78,
      'industrial': 65,
      'servicios': 71
    },
    scoringTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      average_score: Math.floor(Math.random() * 20) + 60,
      hot_leads: Math.floor(Math.random() * 10) + 5
    }))
  };

  const emailMetrics = {
    campaigns: [
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
      }
    ],
    sequences: [
      {
        id: '1',
        name: 'Nurturing General',
        total_enrolled: 156,
        completed: 89,
        completion_rate: 57.1,
        avg_open_rate: 78.5,
        avg_click_rate: 12.3
      }
    ]
  };

  const roiAnalytics = {
    totalInvestment: 11500,
    totalRevenue: 70000,
    overallROI: 508,
    channelROI: [
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
  };

  return {
    // Data
    marketingMetrics,
    contentPerformance,
    leadScoringAnalytics,
    emailMetrics,
    roiAnalytics,
    
    // Loading states
    isLoadingMetrics: false,
    
    // Refresh function
    refetchAll: useCallback(() => {
      console.log('Marketing Hub data refreshed (simulated)');
    }, [])
  };
};
