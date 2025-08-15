
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PredictionEngine, ConversionPrediction, MarketTrend } from '@/utils/analytics/PredictionEngine';
import { AIInsightsGenerator, AIInsight, ContextualInsight } from '@/utils/analytics/AIInsightsGenerator';
import { useMarketingIntelligence } from './useMarketingIntelligence';
import { getAnalytics } from '@/utils/analytics/AnalyticsManager';
import { SUPABASE_CONFIG } from '@/config/supabase';

export interface PredictiveAnalyticsData {
  predictions: ConversionPrediction[];
  insights: AIInsight[];
  marketTrends: MarketTrend[];
  contextualInsights: Map<string, ContextualInsight>;
  anomalies: string[];
  topOpportunities: ConversionPrediction[];
  riskAlerts: AIInsight[];
  optimizationSuggestions: AIInsight[];
}

export const usePredictiveAnalytics = () => {
  const [predictionEngine] = useState(() => new PredictionEngine());
  const [insightsGenerator] = useState(() => new AIInsightsGenerator());
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const { companies, events, summary, leadIntelligence } = useMarketingIntelligence();

  // Generar predicciones para todas las empresas
  const generatePredictions = useCallback(() => {
    if (!companies.length) return [];

    const predictions: ConversionPrediction[] = companies.map(company => {
      const companyEvents = events.filter(e => 
        e.properties?.companyDomain === company.domain
      );

      const calculatorUsed = companyEvents.some(e => 
        e.name.includes('calculator') || e.name.includes('valuation')
      );

      const contactPagesViewed = companyEvents.some(e => 
        e.properties?.page_path?.includes('contacto')
      );

      const downloadedResources = companyEvents.filter(e => 
        e.name.includes('download') || e.name.includes('pdf')
      ).length;

      const predictionInput = {
        companyDomain: company.domain,
        visitCount: company.visitCount,
        pagesViewed: company.pages,
        timeOnSite: company.engagementScore * 10, // Approximate conversion
        engagementScore: company.engagementScore,
        industryMatch: company.industry === 'Technology' || company.industry === 'Finance',
        companySizeMatch: company.size?.includes('50-200') || company.size?.includes('200+'),
        recentActivity: Math.floor((Date.now() - company.lastVisit.getTime()) / (1000 * 60 * 60 * 24)),
        calculatorUsed,
        contactPagesViewed,
        downloadedResources
      };

      return predictionEngine.predictConversion(predictionInput);
    });

    return predictions.sort((a, b) => b.conversionProbability - a.conversionProbability);
  }, [companies, events, predictionEngine]);

  // Generar análisis de mercado
  const generateMarketTrends = useCallback(() => {
    const sectorData = new Map<string, any[]>();
    
    // Agrupar datos por sector
    companies.forEach(company => {
      if (!company.industry) return;
      
      const existing = sectorData.get(company.industry) || [];
      existing.push({
        activity: company.engagementScore,
        visitCount: company.visitCount,
        lastVisit: company.lastVisit
      });
      sectorData.set(company.industry, existing);
    });

    return predictionEngine.analyzeMarketTrends(sectorData);
  }, [companies, predictionEngine]);

  // Generar insights con IA REAL usando OpenAI
  const generateAIInsights = useCallback(async () => {
    setIsGeneratingInsights(true);
    
    try {
      const predictions = generatePredictions();
      const marketTrends = generateMarketTrends();
      
      // Preparar datos reales para análisis con IA
      const analyticsData = {
        companies: companies.slice(0, 20), // Top 20 companies
        leads: companies.map(c => ({
          company_domain: c.domain,
          company_name: c.name,
          industry: c.industry,
          company_size: c.size,
          visit_count: c.visitCount,
          engagement_score: c.engagementScore,
          last_visit: c.lastVisit,
          is_hot_lead: c.engagementScore > 70
        })),
        events: events.slice(0, 100), // Recent events
        conversions: predictions.filter(p => p.conversionProbability > 60),
        timeframe: 'last_30_days'
      };

      // Llamar a la función edge de IA
      const response = await fetch('https://fwhqtzkkvnjkazhaficj.functions.supabase.co/functions/v1/ai-predictive-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`
        },
        body: JSON.stringify({ analyticsData })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.insights) {
        // Convertir insights de OpenAI al formato esperado
        const aiInsights = result.insights.map((insight: any) => ({
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: insight.type,
          priority: insight.priority,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          impact: insight.impact,
          actionable: true,
          actions: insight.actionable_steps || [],
          affectedCompanies: insight.affected_companies || [],
          predictedValue: insight.predicted_value,
          timeHorizon: insight.time_horizon,
          source: 'openai_ai',
          timestamp: new Date().toISOString()
        }));

        console.log('AI Insights generated:', aiInsights);
        setIsGeneratingInsights(false);
        return aiInsights;
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      
      // Fallback a insights simulados mejorados
      const marketTrends = generateMarketTrends();
      const fallbackInsights = insightsGenerator.generateInsights({
        hotLeads: companies.filter(c => c.engagementScore > 70),
        conversionRate: summary?.attribution?.conversionRate || 0,
        sectorTrends: marketTrends.map(trend => ({
          name: trend.sector,
          growth: trend.trendDirection === 'up' ? 50 : 
                  trend.trendDirection === 'down' ? -30 : 0
        }))
      });
      
      setIsGeneratingInsights(false);
      return fallbackInsights;
    }
  }, [generatePredictions, generateMarketTrends, insightsGenerator, summary]);

  // Generar insights contextuales por empresa
  const generateContextualInsights = useCallback((companyDomain: string) => {
    const company = companies.find(c => c.domain === companyDomain);
    if (!company) return null;

    const companyEvents = events.filter(e => 
      e.properties?.companyDomain === companyDomain
    );

    const behaviorData = {
      calculatorUsed: companyEvents.some(e => e.name.includes('calculator')),
      contactPagesViewed: companyEvents.some(e => e.properties?.page_path?.includes('contacto')),
      visitCount: company.visitCount,
      caseStudyViews: companyEvents.filter(e => e.properties?.page_path?.includes('casos')).length,
      downloadedResources: companyEvents.filter(e => e.name.includes('download')).length,
      timeOnSite: company.engagementScore * 10,
      lastVisit: Math.floor((Date.now() - company.lastVisit.getTime()) / (1000 * 60 * 60 * 24)),
      deviceType: 'desktop', // Mock
      location: company.location,
      industry: company.industry,
      companySize: company.size,
      timeOfDay: new Date().getHours(),
      visitFrequency: company.visitCount > 10 ? 'daily' : 'weekly',
      businessHours: { active: true }
    };

    return insightsGenerator.generateContextualInsights(companyDomain, behaviorData);
  }, [companies, events, insightsGenerator]);

  // Actualizar datos predictivos
  const refreshPredictiveData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const predictions = generatePredictions();
      const marketTrends = generateMarketTrends();
      const insights = await generateAIInsights();
      
      // Generar insights contextuales para top companies
      const contextualInsights = new Map<string, ContextualInsight>();
      const topCompanies = predictions.slice(0, 10);
      
      topCompanies.forEach(prediction => {
        const contextual = generateContextualInsights(prediction.companyDomain);
        if (contextual) {
          contextualInsights.set(prediction.companyDomain, contextual);
        }
      });

      // Generar alertas de anomalías
      const analytics = getAnalytics();
      const anomalies = analytics ? 
        predictionEngine.generateAnomalyAlerts(
          { visitCount: companies.length, conversionRate: 12, calculatorUsage: 45 },
          { visitCount: companies.length * 0.8, conversionRate: 15, calculatorUsage: 35 }
        ) : [];

      const predictiveAnalyticsData: PredictiveAnalyticsData = {
        predictions,
        insights,
        marketTrends,
        contextualInsights,
        anomalies,
        topOpportunities: predictions.filter(p => p.conversionProbability > 60).slice(0, 5),
        riskAlerts: insights.filter(i => i.type === 'risk'),
        optimizationSuggestions: insights.filter(i => i.type === 'optimization')
      };

      setPredictiveData(predictiveAnalyticsData);
      console.log('Predictive analytics data generated:', predictiveAnalyticsData);
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generatePredictions, generateMarketTrends, generateAIInsights, generateContextualInsights, companies, predictionEngine]);

  // Datos computados
  const analytics = useMemo(() => {
    if (!predictiveData) return null;

    return {
      totalPredictions: predictiveData.predictions.length,
      highValueOpportunities: predictiveData.predictions.filter(p => p.conversionProbability > 80).length,
      averageConversionProbability: predictiveData.predictions.reduce((sum, p) => sum + p.conversionProbability, 0) / predictiveData.predictions.length,
      criticalInsights: predictiveData.insights.filter(i => i.priority === 'critical').length,
      riskFactors: predictiveData.riskAlerts.length,
      marketOpportunities: predictiveData.marketTrends.filter(t => t.trendDirection === 'up').length,
      avgTimeToConversion: predictiveData.predictions.reduce((sum, p) => sum + p.predictedTimeToConversion, 0) / predictiveData.predictions.length
    };
  }, [predictiveData]);

  // Método para obtener predicción específica
  const getPredictionForCompany = useCallback((companyDomain: string): ConversionPrediction | undefined => {
    return predictiveData?.predictions.find(p => p.companyDomain === companyDomain);
  }, [predictiveData]);

  // Método para obtener insights contextuales
  const getContextualInsights = useCallback((companyDomain: string): ContextualInsight | undefined => {
    return predictiveData?.contextualInsights.get(companyDomain);
  }, [predictiveData]);

  // Método para análisis de texto
  const analyzeText = useCallback((text: string) => {
    return insightsGenerator.analyzeTextIntent(text);
  }, [insightsGenerator]);

  // Auto-refresh cada 10 minutos
  useEffect(() => {
    refreshPredictiveData();
    
    const interval = setInterval(refreshPredictiveData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshPredictiveData]);

  return {
    predictiveData,
    analytics,
    isLoading,
    isGeneratingInsights,
    refreshPredictiveData,
    getPredictionForCompany,
    getContextualInsights,
    analyzeText,
    generateContextualInsights
  };
};
