
import { CompanyData } from './AnalyticsManager';
import { CompanyEnrichmentData, LeadIntelligence } from './CompanyEnrichment';

export interface ScoringCriteria {
  // Company Fit Scoring
  industryMatch: number;
  companySizeMatch: number;
  revenueMatch: number;
  locationMatch: number;
  technologyMatch: number;

  // Behavioral Scoring
  pageDepth: number;
  timeOnSite: number;
  returnVisits: number;
  keyPageVisits: number;
  downloadActions: number;
  formSubmissions: number;

  // Intent Scoring
  pricingPageVisits: number;
  contactPageVisits: number;
  caseStudyViews: number;
  resourceDownloads: number;
  calculatorUsage: number;

  // Engagement Scoring
  emailOpens: number;
  emailClicks: number;
  socialEngagement: number;
  webinarAttendance: number;
}

export class LeadScoringEngine {
  private idealCustomerProfile = {
    industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Professional Services'],
    companySizes: ['50-200', '200-500', '500-1000'],
    revenues: ['€5M+', '€10M+', '€25M+'],
    locations: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'],
    technologies: ['ERP', 'CRM', 'Cloud', 'SaaS']
  };

  calculateLeadScore(
    companyData: CompanyData,
    enrichmentData?: CompanyEnrichmentData,
    visitHistory?: any[]
  ): LeadIntelligence {
    const fitScore = this.calculateFitScore(companyData, enrichmentData);
    const engagementScore = this.calculateEngagementScore(companyData, visitHistory);
    const intentScore = this.calculateIntentScore(companyData, visitHistory);
    
    const overallScore = Math.round(
      (fitScore * 0.4) + (engagementScore * 0.3) + (intentScore * 0.3)
    );

    const triggers = this.identifyTriggers(companyData, enrichmentData, visitHistory);
    const nextActions = this.recommendNextActions(overallScore, triggers);

    return {
      companyData: enrichmentData || {
        name: companyData.name,
        domain: companyData.domain,
        industry: companyData.industry,
        size: companyData.size,
        location: companyData.location
      },
      visitData: {
        firstVisit: new Date(Date.now() - (companyData.visitCount * 24 * 60 * 60 * 1000)),
        lastVisit: companyData.lastVisit,
        totalVisits: companyData.visitCount,
        pagesViewed: companyData.pages,
        timeOnSite: companyData.engagementScore * 60, // Convert to seconds
        deviceTypes: ['Desktop'], // Mock data
        referralSources: ['Google', 'Direct'] // Mock data
      },
      engagementScore,
      intentScore,
      fitScore,
      overallScore,
      triggers,
      nextActions
    };
  }

  private calculateFitScore(companyData: CompanyData, enrichmentData?: CompanyEnrichmentData): number {
    let score = 0;
    const maxScore = 100;

    // Industry match (25 points)
    if (companyData.industry && this.idealCustomerProfile.industries.includes(companyData.industry)) {
      score += 25;
    }

    // Company size match (20 points)
    if (companyData.size && this.idealCustomerProfile.companySizes.some(size => 
      companyData.size?.includes(size.split('-')[0]))) {
      score += 20;
    }

    // Location match (15 points)
    if (companyData.location && this.idealCustomerProfile.locations.some(loc => 
      companyData.location?.includes(loc))) {
      score += 15;
    }

    // Technology stack match (20 points)
    if (enrichmentData?.technologies) {
      const techMatches = enrichmentData.technologies.filter(tech => 
        this.idealCustomerProfile.technologies.some(idealTech => 
          tech.toLowerCase().includes(idealTech.toLowerCase())
        )
      );
      score += Math.min(techMatches.length * 5, 20);
    }

    // Revenue match (20 points)
    if (enrichmentData?.revenue && enrichmentData.revenue.includes('€')) {
      const revenueValue = enrichmentData.revenue;
      if (revenueValue.includes('M') && (revenueValue.includes('5') || revenueValue.includes('10'))) {
        score += 20;
      }
    }

    return Math.min(score, maxScore);
  }

  private calculateEngagementScore(companyData: CompanyData, visitHistory?: any[]): number {
    let score = 0;

    // Visit frequency (30 points)
    score += Math.min(companyData.visitCount * 5, 30);

    // Page depth (25 points)
    score += Math.min(companyData.pages.length * 3, 25);

    // Time engagement (25 points)
    score += Math.min(companyData.engagementScore, 25);

    // Return visitor bonus (20 points)
    if (companyData.visitCount > 1) {
      score += Math.min(companyData.visitCount * 2, 20);
    }

    return Math.min(score, 100);
  }

  private calculateIntentScore(companyData: CompanyData, visitHistory?: any[]): number {
    let score = 0;

    // Key page visits
    const keyPages = ['/contacto', '/calculadora-valoracion', '/venta-empresas', '/servicios'];
    const keyPageVisits = companyData.pages.filter(page => 
      keyPages.some(keyPage => page.includes(keyPage))
    );

    // High-intent page visits (40 points)
    score += Math.min(keyPageVisits.length * 10, 40);

    // Calculator usage (30 points)
    if (companyData.pages.some(page => page.includes('calculadora'))) {
      score += 30;
    }

    // Contact page visits (20 points)
    if (companyData.pages.some(page => page.includes('contacto'))) {
      score += 20;
    }

    // Multiple session bonus (10 points)
    if (companyData.visitCount >= 3) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  private identifyTriggers(
    companyData: CompanyData, 
    enrichmentData?: CompanyEnrichmentData,
    visitHistory?: any[]
  ): string[] {
    const triggers: string[] = [];

    // High engagement trigger
    if (companyData.engagementScore > 15) {
      triggers.push('🔥 Alta Engagement - Tiempo prolongado en el sitio');
    }

    // Multiple visits trigger
    if (companyData.visitCount >= 3) {
      triggers.push('🔄 Visitante Recurrente - 3+ visitas');
    }

    // Key page trigger
    if (companyData.pages.some(page => page.includes('calculadora'))) {
      triggers.push('💰 Interesa Valoración - Usó calculadora');
    }

    // Contact intent trigger
    if (companyData.pages.some(page => page.includes('contacto'))) {
      triggers.push('📞 Intención de Contacto - Visitó página de contacto');
    }

    // Ideal company profile trigger
    if (companyData.industry && ['Technology', 'Finance'].includes(companyData.industry)) {
      triggers.push('🎯 Perfil Ideal - Sector objetivo');
    }

    // Company size trigger
    if (enrichmentData?.employees && parseInt(enrichmentData.employees) > 50) {
      triggers.push('🏢 Empresa Mediana/Grande - +50 empleados');
    }

    return triggers;
  }

  private recommendNextActions(score: number, triggers: string[]): string[] {
    const actions: string[] = [];

    if (score >= 80) {
      actions.push('🚨 Contacto Inmediato - Lead caliente');
      actions.push('📧 Email personalizado del director');
      actions.push('📅 Proponer reunión esta semana');
    } else if (score >= 60) {
      actions.push('📞 Llamada comercial en 24-48h');
      actions.push('📧 Enviar caso de estudio relevante');
      actions.push('🎯 Añadir a secuencia de nurturing');
    } else if (score >= 40) {
      actions.push('📧 Email de seguimiento automático');
      actions.push('📚 Enviar contenido educativo');
      actions.push('🔍 Monitorear actividad futura');
    } else {
      actions.push('👀 Continuar seguimiento pasivo');
      actions.push('📈 Esperar más señales de interés');
    }

    // Add trigger-specific actions
    if (triggers.some(t => t.includes('calculadora'))) {
      actions.push('💡 Ofrecer análisis gratuito personalizado');
    }

    if (triggers.some(t => t.includes('contacto'))) {
      actions.push('⚡ Respuesta rápida - mostraron interés directo');
    }

    return actions;
  }
}
