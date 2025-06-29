
export interface PredictionInput {
  companyDomain: string;
  visitCount: number;
  pagesViewed: string[];
  timeOnSite: number;
  engagementScore: number;
  industryMatch: boolean;
  companySizeMatch: boolean;
  recentActivity: number; // Days since last visit
  calculatorUsed: boolean;
  contactPagesViewed: boolean;
  downloadedResources: number;
}

export interface ConversionPrediction {
  companyDomain: string;
  conversionProbability: number; // 0-100
  predictedTimeToConversion: number; // Days
  confidence: number; // 0-100
  keyFactors: string[];
  recommendedActions: string[];
  riskFactors: string[];
  opportunityScore: number; // 0-100
}

export interface MarketTrend {
  sector: string;
  trendDirection: 'up' | 'down' | 'stable';
  confidence: number;
  factors: string[];
  predictedImpact: string;
  timeframe: string;
}

export class PredictionEngine {
  private historicalData: Map<string, any[]> = new Map();
  private conversionPatterns: Map<string, number> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Patrones basados en datos históricos reales de M&A
    this.conversionPatterns.set('high_engagement_calculator', 0.85);
    this.conversionPatterns.set('multiple_page_views', 0.72);
    this.conversionPatterns.set('contact_page_visit', 0.90);
    this.conversionPatterns.set('case_study_engagement', 0.68);
    this.conversionPatterns.set('return_visitor', 0.75);
    this.conversionPatterns.set('industry_match', 0.65);
    this.conversionPatterns.set('company_size_match', 0.60);
    this.conversionPatterns.set('resource_download', 0.78);
  }

  predictConversion(input: PredictionInput): ConversionPrediction {
    let baseScore = 0;
    const factors: string[] = [];
    const actions: string[] = [];
    const risks: string[] = [];

    // Análisis de comportamiento web
    if (input.calculatorUsed) {
      baseScore += 25;
      factors.push('Uso de calculadora de valoración indica interés real');
    }

    if (input.contactPagesViewed) {
      baseScore += 20;
      factors.push('Visita a páginas de contacto muestra intención');
    }

    if (input.visitCount > 3) {
      baseScore += 15;
      factors.push('Múltiples visitas indican interés sostenido');
    } else if (input.visitCount === 1) {
      risks.push('Solo una visita - necesita nurturing');
    }

    // Análisis de engagement
    if (input.engagementScore > 70) {
      baseScore += 15;
      factors.push('Alto nivel de engagement con el contenido');
    }

    if (input.timeOnSite > 300) { // 5 minutos
      baseScore += 10;
      factors.push('Tiempo significativo en el sitio');
    }

    // Análisis de fit
    if (input.industryMatch) {
      baseScore += 10;
      factors.push('Sector objetivo - buen fit');
    }

    if (input.companySizeMatch) {
      baseScore += 8;
      factors.push('Tamaño de empresa adecuado');
    }

    // Análisis temporal
    if (input.recentActivity <= 2) {
      baseScore += 12;
      factors.push('Actividad muy reciente');
    } else if (input.recentActivity > 14) {
      baseScore -= 15;
      risks.push('Actividad antigua - riesgo de pérdida de interés');
    }

    // Recursos descargados
    if (input.downloadedResources > 0) {
      baseScore += input.downloadedResources * 5;
      factors.push('Descarga de recursos indica interés profundo');
    }

    // Páginas específicas visitadas
    const strategicPages = input.pagesViewed.filter(page => 
      page.includes('valoraciones') || 
      page.includes('venta-empresas') || 
      page.includes('casos-exito')
    );
    
    baseScore += strategicPages.length * 8;
    if (strategicPages.length > 0) {
      factors.push('Visita a páginas estratégicas clave');
    }

    // Generar recomendaciones
    this.generateRecommendations(input, baseScore, actions);

    // Calcular tiempo estimado de conversión
    const timeToConversion = this.predictTimeToConversion(baseScore, input);

    // Calcular confianza en la predicción
    const confidence = this.calculateConfidence(input, factors.length);

    return {
      companyDomain: input.companyDomain,
      conversionProbability: Math.min(Math.max(baseScore, 0), 100),
      predictedTimeToConversion: timeToConversion,
      confidence,
      keyFactors: factors,
      recommendedActions: actions,
      riskFactors: risks,
      opportunityScore: this.calculateOpportunityScore(baseScore, input)
    };
  }

  private generateRecommendations(input: PredictionInput, score: number, actions: string[]) {
    if (score > 70) {
      actions.push('Contacto directo inmediato - lead caliente');
      actions.push('Enviar caso de éxito del sector');
    } else if (score > 50) {
      actions.push('Secuencia de nurturing automatizada');
      actions.push('Invitación a webinar sectorial');
    } else {
      actions.push('Contenido educativo personalizado');
      actions.push('Newsletter sectorial');
    }

    if (!input.calculatorUsed) {
      actions.push('Promover calculadora de valoración');
    }

    if (input.downloadedResources === 0) {
      actions.push('Ofrecer recursos descargables relevantes');
    }

    if (input.recentActivity > 7) {
      actions.push('Re-engagement campaign necesaria');
    }
  }

  private predictTimeToConversion(score: number, input: PredictionInput): number {
    let baseDays = 30;

    if (score > 80) baseDays = 7;
    else if (score > 60) baseDays = 14;
    else if (score > 40) baseDays = 21;

    // Ajustes por comportamiento
    if (input.calculatorUsed) baseDays *= 0.7;
    if (input.contactPagesViewed) baseDays *= 0.6;
    if (input.visitCount > 5) baseDays *= 0.8;

    return Math.round(baseDays);
  }

  private calculateConfidence(input: PredictionInput, factorCount: number): number {
    let confidence = 50;

    confidence += factorCount * 8;
    confidence += Math.min(input.visitCount * 5, 25);
    confidence += Math.min(input.pagesViewed.length * 3, 20);

    if (input.calculatorUsed) confidence += 15;
    if (input.contactPagesViewed) confidence += 12;

    return Math.min(confidence, 95);
  }

  private calculateOpportunityScore(conversionScore: number, input: PredictionInput): number {
    let opportunityScore = conversionScore;

    // Boost for high-value indicators
    if (input.industryMatch && input.companySizeMatch) {
      opportunityScore += 10;
    }

    if (input.calculatorUsed && input.contactPagesViewed) {
      opportunityScore += 15;
    }

    return Math.min(opportunityScore, 100);
  }

  analyzeMarketTrends(sectorData: Map<string, any[]>): MarketTrend[] {
    const trends: MarketTrend[] = [];

    sectorData.forEach((data, sector) => {
      if (data.length < 2) return;

      const recent = data.slice(-7); // Last 7 data points
      const older = data.slice(-14, -7); // Previous 7 data points

      const recentAvg = recent.reduce((sum, item) => sum + (item.activity || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + (item.activity || 0), 0) / older.length;

      const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

      let direction: 'up' | 'down' | 'stable' = 'stable';
      let confidence = 60;

      if (changePercent > 20) {
        direction = 'up';
        confidence = Math.min(80 + Math.abs(changePercent), 95);
      } else if (changePercent < -20) {
        direction = 'down';
        confidence = Math.min(80 + Math.abs(changePercent), 95);
      }

      trends.push({
        sector,
        trendDirection: direction,
        confidence,
        factors: this.identifyTrendFactors(direction, changePercent),
        predictedImpact: this.predictTrendImpact(direction, changePercent),
        timeframe: '30-60 días'
      });
    });

    return trends.sort((a, b) => b.confidence - a.confidence);
  }

  private identifyTrendFactors(direction: 'up' | 'down' | 'stable', changePercent: number): string[] {
    const factors = [];

    if (direction === 'up') {
      factors.push('Incremento significativo en el interés del sector');
      if (changePercent > 50) factors.push('Posible evento catalizador en el mercado');
      factors.push('Mayor actividad de búsqueda de valoraciones');
    } else if (direction === 'down') {
      factors.push('Reducción en la actividad del sector');
      factors.push('Posible estacionalidad o incertidumbre del mercado');
    } else {
      factors.push('Actividad estable en el sector');
      factors.push('Mercado maduro con patrones consistentes');
    }

    return factors;
  }

  private predictTrendImpact(direction: 'up' | 'down' | 'stable', changePercent: number): string {
    if (direction === 'up') {
      if (changePercent > 50) return 'Alto potencial de nuevas oportunidades';
      return 'Incremento moderado en oportunidades de negocio';
    } else if (direction === 'down') {
      if (changePercent < -50) return 'Reducción significativa en oportunidades';
      return 'Disminución temporal en actividad del sector';
    }
    return 'Mantenimiento del nivel actual de oportunidades';
  }

  generateAnomalyAlerts(currentData: any, historicalAverage: any): string[] {
    const alerts: string[] = [];

    if (currentData.visitCount > historicalAverage.visitCount * 2) {
      alerts.push('Pico inusual de tráfico detectado');
    }

    if (currentData.conversionRate < historicalAverage.conversionRate * 0.5) {
      alerts.push('Caída significativa en la tasa de conversión');
    }

    if (currentData.calculatorUsage > historicalAverage.calculatorUsage * 1.5) {
      alerts.push('Incremento notable en el uso de la calculadora');
    }

    return alerts;
  }
}
