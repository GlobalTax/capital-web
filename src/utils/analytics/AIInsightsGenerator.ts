
export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'optimization' | 'competitive';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dataPoints: any[];
  confidence: number;
  actionable: boolean;
  recommendations: string[];
  timeframe: string;
  potentialImpact: string;
  category: string;
}

export interface ContextualInsight {
  companyDomain: string;
  insights: AIInsight[];
  behaviorPattern: string;
  nextBestAction: string;
  timing: string;
  contextualFactors: string[];
}

export class AIInsightsGenerator {
  private insights: AIInsight[] = [];
  private patterns: Map<string, any> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Patrones de comportamiento identificados en M&A
    this.patterns.set('hot_lead_pattern', {
      indicators: ['calculator_use', 'multiple_visits', 'contact_page'],
      confidence: 0.85,
      action: 'immediate_contact'
    });

    this.patterns.set('research_phase_pattern', {
      indicators: ['case_study_views', 'resource_downloads', 'blog_engagement'],
      confidence: 0.70,
      action: 'nurture_sequence'
    });

    this.patterns.set('comparison_pattern', {
      indicators: ['competitor_searches', 'multiple_calculators', 'pricing_focus'],
      confidence: 0.75,
      action: 'competitive_differentiation'
    });
  }

  generateInsights(data: any): AIInsight[] {
    const insights: AIInsight[] = [];

    // Análisis de oportunidades
    insights.push(...this.analyzeOpportunities(data));
    
    // Análisis de riesgos
    insights.push(...this.analyzeRisks(data));
    
    // Análisis de tendencias
    insights.push(...this.analyzeTrends(data));
    
    // Análisis de optimización
    insights.push(...this.analyzeOptimization(data));

    // Análisis competitivo
    insights.push(...this.analyzeCompetitive(data));

    return insights.sort((a, b) => this.priorityScore(b.priority) - this.priorityScore(a.priority));
  }

  private analyzeOpportunities(data: any): AIInsight[] {
    const opportunities: AIInsight[] = [];

    // Oportunidad: Leads calientes no contactados
    if (data.hotLeads && data.hotLeads.length > 0) {
      opportunities.push({
        id: `opportunity_hot_leads_${Date.now()}`,
        type: 'opportunity',
        priority: 'critical',
        title: `${data.hotLeads.length} leads calientes requieren atención inmediata`,
        description: 'Hay empresas con alta probabilidad de conversión que no han sido contactadas en las últimas 24 horas.',
        dataPoints: data.hotLeads,
        confidence: 90,
        actionable: true,
        recommendations: [
          'Contactar inmediatamente a través del canal preferido',
          'Preparar propuesta personalizada basada en su comportamiento',
          'Programar seguimiento en 2-3 días'
        ],
        timeframe: '24 horas',
        potentialImpact: 'Alto - Conversión potencial inmediata',
        category: 'Lead Generation'
      });
    }

    // Oportunidad: Sector emergente
    if (data.sectorTrends) {
      const emergingSectors = data.sectorTrends.filter((s: any) => s.growth > 50);
      if (emergingSectors.length > 0) {
        opportunities.push({
          id: `opportunity_emerging_sector_${Date.now()}`,
          type: 'opportunity',
          priority: 'high',
          title: 'Sectores emergentes con alto crecimiento detectados',
          description: `Los sectores ${emergingSectors.map((s: any) => s.name).join(', ')} muestran un crecimiento excepcional.`,
          dataPoints: emergingSectors,
          confidence: 80,
          actionable: true,
          recommendations: [
            'Desarrollar contenido específico para estos sectores',
            'Crear campañas de marketing dirigidas',
            'Contactar leads existentes en estos sectores'
          ],
          timeframe: '2-4 semanas',
          potentialImpact: 'Alto - Expansión a nuevos mercados',
          category: 'Market Expansion'
        });
      }
    }

    return opportunities;
  }

  private analyzeRisks(data: any): AIInsight[] {
    const risks: AIInsight[] = [];

    // Riesgo: Caída en conversiones
    if (data.conversionRate && data.historicalConversionRate) {
      const decline = ((data.historicalConversionRate - data.conversionRate) / data.historicalConversionRate) * 100;
      if (decline > 20) {
        risks.push({
          id: `risk_conversion_decline_${Date.now()}`,
          type: 'risk',
          priority: 'high',
          title: 'Caída significativa en la tasa de conversión',
          description: `La tasa de conversión ha caído un ${decline.toFixed(1)}% comparado con el período anterior.`,
          dataPoints: [data.conversionRate, data.historicalConversionRate],
          confidence: 85,
          actionable: true,
          recommendations: [
            'Revisar cambios recientes en el sitio web',
            'Analizar calidad del tráfico entrante',
            'Optimizar proceso de conversión',
            'A/B test de elementos clave'
          ],
          timeframe: '1-2 semanas',
          potentialImpact: 'Alto - Pérdida de ingresos potenciales',
          category: 'Conversion Optimization'
        });
      }
    }

    // Riesgo: Leads fríos abandonando
    if (data.churningLeads && data.churningLeads.length > 0) {
      risks.push({
        id: `risk_churning_leads_${Date.now()}`,
        type: 'risk',
        priority: 'medium',
        title: `${data.churningLeads.length} leads en riesgo de abandono`,
        description: 'Leads que mostraron interés inicial pero han reducido su actividad significativamente.',
        dataPoints: data.churningLeads,
        confidence: 75,
        actionable: true,
        recommendations: [
          'Campaña de re-engagement personalizada',
          'Oferta especial o incentivo',
          'Contenido de valor específico',
          'Contacto directo para entender objeciones'
        ],
        timeframe: '1 semana',
        potentialImpact: 'Medio - Recuperación de oportunidades perdidas',
        category: 'Lead Retention'
      });
    }

    return risks;
  }

  private analyzeTrends(data: any): AIInsight[] {
    const trends: AIInsight[] = [];

    // Tendencia: Incremento en uso de calculadora
    if (data.calculatorUsage && data.calculatorUsage.trend === 'increasing') {
      trends.push({
        id: `trend_calculator_usage_${Date.now()}`,
        type: 'trend',
        priority: 'medium',
        title: 'Incremento sostenido en el uso de la calculadora',
        description: `El uso de la calculadora de valoración ha aumentado un ${data.calculatorUsage.increase}% en las últimas semanas.`,
        dataPoints: data.calculatorUsage.data,
        confidence: 80,
        actionable: true,
        recommendations: [
          'Optimizar la experiencia de la calculadora',
          'Agregar más opciones de personalización',
          'Implementar seguimiento automático post-cálculo',
          'Crear contenido relacionado con valoraciones'
        ],
        timeframe: '2-3 semanas',
        potentialImpact: 'Medio - Mayor engagement y conversiones',
        category: 'User Experience'
      });
    }

    return trends;
  }

  private analyzeOptimization(data: any): AIInsight[] {
    const optimizations: AIInsight[] = [];

    // Optimización: Páginas con alto bounce rate
    if (data.highBouncePages && data.highBouncePages.length > 0) {
      optimizations.push({
        id: `optimization_bounce_rate_${Date.now()}`,
        type: 'optimization',
        priority: 'medium',
        title: 'Páginas con alta tasa de rebote identificadas',
        description: `${data.highBouncePages.length} páginas tienen tasas de rebote superiores al 80%.`,
        dataPoints: data.highBouncePages,
        confidence: 90,
        actionable: true,
        recommendations: [
          'Mejorar velocidad de carga de las páginas',
          'Optimizar contenido para mayor relevancia',
          'Mejorar calls-to-action',
          'Implementar elementos interactivos'
        ],
        timeframe: '2-4 semanas',
        potentialImpact: 'Medio - Mejor experiencia de usuario y conversiones',
        category: 'Website Optimization'
      });
    }

    return optimizations;
  }

  private analyzeCompetitive(data: any): AIInsight[] {
    const competitive: AIInsight[] = [];

    // Análsis competitivo: Términos de búsqueda
    if (data.competitiveKeywords && data.competitiveKeywords.length > 0) {
      competitive.push({
        id: `competitive_keywords_${Date.now()}`,
        type: 'competitive',
        priority: 'low',
        title: 'Oportunidades de palabras clave competitivas',
        description: 'Se han identificado términos de búsqueda donde los competidores están ganando tráfico.',
        dataPoints: data.competitiveKeywords,
        confidence: 70,
        actionable: true,
        recommendations: [
          'Crear contenido optimizado para estas keywords',
          'Mejorar SEO on-page para términos específicos',
          'Considerar campañas de PPC para keywords de alta conversión'
        ],
        timeframe: '4-6 semanas',
        potentialImpact: 'Medio - Mayor visibilidad orgánica',
        category: 'SEO & Content'
      });
    }

    return competitive;
  }

  generateContextualInsights(companyDomain: string, behaviorData: any): ContextualInsight {
    const insights = this.generateInsights(behaviorData);
    const pattern = this.identifyBehaviorPattern(behaviorData);
    const nextAction = this.determineNextBestAction(pattern, behaviorData);
    const timing = this.optimizeTiming(behaviorData);

    return {
      companyDomain,
      insights: insights.slice(0, 3), // Top 3 más relevantes
      behaviorPattern: pattern,
      nextBestAction: nextAction,
      timing,
      contextualFactors: this.identifyContextualFactors(behaviorData)
    };
  }

  private identifyBehaviorPattern(data: any): string {
    if (data.calculatorUsed && data.contactPagesViewed && data.visitCount > 2) {
      return 'Buyer Intent - Alta probabilidad de conversión inmediata';
    }
    
    if (data.caseStudyViews > 2 && data.downloadedResources > 0) {
      return 'Research Phase - Comparando opciones y validando decisión';
    }
    
    if (data.visitCount === 1 && data.timeOnSite > 300) {
      return 'Discovery Phase - Primer contacto con alto interés';
    }
    
    if (data.visitCount > 5 && !data.calculatorUsed) {
      return 'Evaluation Phase - Interesado pero necesita más información';
    }

    return 'Awareness Phase - Explorando opciones iniciales';
  }

  private determineNextBestAction(pattern: string, data: any): string {
    switch (pattern) {
      case 'Buyer Intent - Alta probabilidad de conversión inmediata':
        return 'Contacto directo inmediato con propuesta personalizada';
      case 'Research Phase - Comparando opciones y validando decisión':
        return 'Enviar caso de éxito relevante y agendar demo';
      case 'Discovery Phase - Primer contacto con alto interés':
        return 'Secuencia de nurturing con contenido educativo';
      case 'Evaluation Phase - Interesado pero necesita más información':
        return 'Promover uso de calculadora y recursos específicos';
      default:
        return 'Contenido educativo de valor para generar interés';
    }
  }

  private optimizeTiming(data: any): string {
    if (data.lastVisit && data.lastVisit <= 1) {
      return 'Inmediato - Ventana de oportunidad abierta';
    }
    
    if (data.visitFrequency && data.visitFrequency === 'daily') {
      return 'Próximas 24 horas - Patrón de visita activo';
    }
    
    if (data.businessHours && data.businessHours.active) {
      return 'Durante horario de oficina - Mayor probabilidad de respuesta';
    }

    return 'Próximos 2-3 días - Timing óptimo para engagement';
  }

  private identifyContextualFactors(data: any): string[] {
    const factors = [];

    if (data.deviceType === 'mobile') {
      factors.push('Usuario móvil - Considerar formato de comunicación optimizado');
    }

    if (data.location && data.location.includes('Madrid')) {
      factors.push('Ubicación Madrid - Posibilidad de reunión presencial');
    }

    if (data.industry && data.industry === 'Technology') {
      factors.push('Sector tecnológico - Decisión más rápida, mayor valor promedio');
    }

    if (data.companySize && data.companySize.includes('50-200')) {
      factors.push('Empresa mediana - Proceso de decisión estructurado');
    }

    if (data.timeOfDay && (data.timeOfDay >= 9 && data.timeOfDay <= 18)) {
      factors.push('Actividad en horario laboral - Mayor probabilidad de decisor');
    }

    return factors;
  }

  private priorityScore(priority: string): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // Método para análisis de texto con NLP básico
  analyzeTextIntent(text: string): { intent: string; confidence: number; keywords: string[] } {
    const lowercaseText = text.toLowerCase();
    
    // Palabras clave de intención de compra
    const buyIntent = ['comprar', 'vender', 'valorar', 'precio', 'coste', 'inversión', 'adquisición'];
    const researchIntent = ['comparar', 'diferencia', 'opciones', 'alternativas', 'cómo', 'qué'];
    const urgentIntent = ['urgente', 'rápido', 'inmediato', 'ya', 'pronto', 'necesito'];

    const buyScore = buyIntent.filter(word => lowercaseText.includes(word)).length;
    const researchScore = researchIntent.filter(word => lowercaseText.includes(word)).length;
    const urgentScore = urgentIntent.filter(word => lowercaseText.includes(word)).length;

    let intent = 'exploration';
    let confidence = 60;

    if (buyScore > researchScore && buyScore > 0) {
      intent = 'purchase';
      confidence = Math.min(60 + buyScore * 15, 95);
    } else if (researchScore > 0) {
      intent = 'research';
      confidence = Math.min(60 + researchScore * 10, 85);
    }

    if (urgentScore > 0) {
      confidence += urgentScore * 10;
      intent += '_urgent';
    }

    const keywords = [
      ...buyIntent.filter(word => lowercaseText.includes(word)),
      ...researchIntent.filter(word => lowercaseText.includes(word)),
      ...urgentIntent.filter(word => lowercaseText.includes(word))
    ];

    return {
      intent,
      confidence: Math.min(confidence, 95),
      keywords
    };
  }
}
