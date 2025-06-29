export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp?: Date;
  source?: string;
}

export interface CompanyData {
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  location?: string;
  visitCount: number;
  lastVisit: Date;
  pages: string[];
  engagementScore: number;
}

export interface AnalyticsConfig {
  ga4MeasurementId?: string;
  clarityProjectId?: string;
  leadfeederTrackingId?: string;
  enableCompanyTracking?: boolean;
  enableEnrichment?: boolean;
  enableAlerting?: boolean;
}

import { CompanyEnrichmentService, LeadIntelligence } from './CompanyEnrichment';
import { LeadScoringEngine } from './LeadScoringEngine';
import { AlertingSystem } from './AlertingSystem';

export class AnalyticsManager {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private companies: Map<string, CompanyData> = new Map();
  private enrichmentService: CompanyEnrichmentService;
  private scoringEngine: LeadScoringEngine;
  private alertingSystem: AlertingSystem;
  private leadIntelligence: Map<string, LeadIntelligence> = new Map();

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.enrichmentService = new CompanyEnrichmentService();
    this.scoringEngine = new LeadScoringEngine();
    this.alertingSystem = new AlertingSystem();
    this.init();
  }

  private init() {
    if (this.config.ga4MeasurementId) {
      this.initGA4(this.config.ga4MeasurementId);
    }
    
    if (this.config.clarityProjectId) {
      this.initClarity(this.config.clarityProjectId);
    }

    if (this.config.leadfeederTrackingId && this.config.enableCompanyTracking) {
      this.initCompanyTracking(this.config.leadfeederTrackingId);
    }

    // Track page views automatically
    this.trackPageView();
  }

  // Google Analytics 4 Integration
  private initGA4(measurementId: string) {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    const gtag = (...args: any[]) => {
      (window as any).dataLayer.push(args);
    };
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: false // We'll control this manually
    });

    console.log('GA4 initialized with ID:', measurementId);
  }

  // Microsoft Clarity Integration
  private initClarity(projectId: string) {
    (window as any).clarity = (window as any).clarity || function(...args: any[]) {
      ((window as any).clarity.q = (window as any).clarity.q || []).push(args);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;
    document.head.appendChild(script);

    console.log('Microsoft Clarity initialized with ID:', projectId);
  }

  // Company Intelligence Tracking
  private initCompanyTracking(trackingId: string) {
    // Simulate company detection based on IP/domain patterns
    this.detectVisitingCompany();
    
    console.log('Company tracking initialized with ID:', trackingId);
  }

  // Unified Event Tracking
  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      source: 'unified'
    };

    // Store locally
    this.events.push(event);

    // Send to GA4
    if (this.config.ga4MeasurementId && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // Send to Clarity
    if (this.config.clarityProjectId && (window as any).clarity) {
      (window as any).clarity('event', eventName);
    }

    console.log('Event tracked:', event);
  }

  // Page View Tracking
  trackPageView(path?: string) {
    const currentPath = path || window.location.pathname;
    
    this.trackEvent('page_view', {
      page_path: currentPath,
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Lead Scoring
  calculateLeadScore(companyDomain: string): number {
    const companyData = this.companies.get(companyDomain);
    if (!companyData) return 0;

    const leadIntel = this.leadIntelligence.get(companyDomain);
    if (leadIntel) {
      return leadIntel.overallScore;
    }

    // Fallback to basic scoring
    let score = 0;
    
    // Visit frequency (max 30 points)
    score += Math.min(companyData.visitCount * 5, 30);
    
    // Page depth (max 25 points)
    score += Math.min(companyData.pages.length * 3, 25);
    
    // Engagement time (max 25 points)
    score += Math.min(companyData.engagementScore, 25);
    
    // Industry relevance (max 20 points)
    if (companyData.industry && ['Technology', 'Finance', 'Healthcare', 'Manufacturing'].includes(companyData.industry)) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  // Company Detection (simulated)
  private detectVisitingCompany() {
    // In a real implementation, this would integrate with services like:
    // - Leadfeeder
    // - Clearbit Reveal
    // - 6sense
    // - Demandbase
    
    // For now, simulate company detection
    setTimeout(() => {
      this.identifyCompany({
        name: 'Empresa Demo S.L.',
        domain: 'empresademo.com',
        industry: 'Technology',
        size: '50-200',
        location: 'Madrid, España',
        visitCount: 1,
        lastVisit: new Date(),
        pages: [window.location.pathname],
        engagementScore: 15
      });
    }, 2000);
  }

  // Enhanced company identification with enrichment and scoring
  async identifyCompany(companyData: CompanyData) {
    const existing = this.companies.get(companyData.domain);
    
    if (existing) {
      // Update existing company data
      existing.visitCount++;
      existing.lastVisit = new Date();
      existing.pages = [...new Set([...existing.pages, ...companyData.pages])];
      existing.engagementScore += companyData.engagementScore;
    } else {
      // Add new company
      this.companies.set(companyData.domain, companyData);
    }

    // Enhanced processing for new or updated companies
    if (this.config.enableEnrichment || this.config.enableAlerting) {
      await this.processCompanyIntelligence(companyData.domain);
    }

    // Track company visit event
    this.trackEvent('company_identified', {
      company_name: companyData.name,
      company_domain: companyData.domain,
      company_industry: companyData.industry,
      lead_score: this.calculateLeadScore(companyData.domain)
    });

    console.log('Company identified:', companyData);
  }

  private async processCompanyIntelligence(domain: string): Promise<void> {
    const companyData = this.companies.get(domain);
    if (!companyData) return;

    try {
      // Enrich company data
      let enrichmentData = null;
      if (this.config.enableEnrichment) {
        enrichmentData = await this.enrichmentService.enrichCompanyData(domain);
      }

      // Calculate advanced lead intelligence
      const leadIntel = this.scoringEngine.calculateLeadScore(
        companyData,
        enrichmentData || undefined
      );

      // Store lead intelligence
      this.leadIntelligence.set(domain, leadIntel);

      // Process alerts
      if (this.config.enableAlerting) {
        const alerts = this.alertingSystem.processLeadIntelligence(leadIntel);
        
        if (alerts.length > 0) {
          console.log(`🚨 Generated ${alerts.length} alerts for ${companyData.name}`);
          
          // Emit custom event for UI updates
          window.dispatchEvent(new CustomEvent('marketing-intelligence-alert', {
            detail: { alerts, leadIntel }
          }));
        }
      }

    } catch (error) {
      console.error('Error processing company intelligence:', error);
    }
  }

  // New methods for enhanced analytics
  getLeadIntelligence(domain: string): LeadIntelligence | undefined {
    return this.leadIntelligence.get(domain);
  }

  getAllLeadIntelligence(): LeadIntelligence[] {
    return Array.from(this.leadIntelligence.values());
  }

  getAlerts(filters?: any) {
    return this.alertingSystem.getAlerts(filters);
  }

  getUnreadAlertsCount(): number {
    return this.alertingSystem.getUnreadCount();
  }

  markAlertAsRead(alertId: string): void {
    return this.alertingSystem.markAsRead(alertId);
  }

  async enrichCompanyData(domain: string) {
    return await this.enrichmentService.enrichCompanyData(domain);
  }

  // Get Analytics Data
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  getCompanies(): CompanyData[] {
    return Array.from(this.companies.values());
  }

  getTopCompanies(limit: number = 10): CompanyData[] {
    return this.getCompanies()
      .sort((a, b) => this.calculateLeadScore(b.domain) - this.calculateLeadScore(a.domain))
      .slice(0, limit);
  }

  // Analytics Summary
  getAnalyticsSummary() {
    const events = this.getEvents();
    const companies = this.getCompanies();
    const leadIntelligence = this.getAllLeadIntelligence();
    const alerts = this.getAlerts({ isRead: false });
    
    return {
      totalEvents: events.length,
      totalCompanies: companies.length,
      totalLeadIntelligence: leadIntelligence.length,
      unreadAlerts: alerts.length,
      topEvents: this.getTopEvents(),
      recentActivity: events.slice(-10).reverse(),
      leadScore: {
        high: companies.filter(c => this.calculateLeadScore(c.domain) >= 70).length,
        medium: companies.filter(c => this.calculateLeadScore(c.domain) >= 40 && this.calculateLeadScore(c.domain) < 70).length,
        low: companies.filter(c => this.calculateLeadScore(c.domain) < 40).length
      },
      alertsByPriority: {
        critical: alerts.filter(a => a.priority === 'critical').length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length
      },
      topIndustries: this.getTopIndustries(),
      conversionFunnel: this.getConversionFunnel()
    };
  }

  private getTopIndustries(): Array<{industry: string, count: number, avgScore: number}> {
    const industries = new Map<string, {count: number, totalScore: number}>();
    
    this.getCompanies().forEach(company => {
      if (company.industry) {
        const current = industries.get(company.industry) || {count: 0, totalScore: 0};
        current.count++;
        current.totalScore += this.calculateLeadScore(company.domain);
        industries.set(company.industry, current);
      }
    });

    return Array.from(industries.entries())
      .map(([industry, data]) => ({
        industry,
        count: data.count,
        avgScore: Math.round(data.totalScore / data.count)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getConversionFunnel(): {stage: string, count: number, percentage: number}[] {
    const companies = this.getCompanies();
    const total = companies.length;
    
    if (total === 0) return [];

    const stages = [
      {
        stage: 'Visitantes únicos',
        count: total,
        percentage: 100
      },
      {
        stage: 'Visitantes recurrentes',
        count: companies.filter(c => c.visitCount > 1).length,
        percentage: 0
      },
      {
        stage: 'Interés alto (calculadora)',
        count: companies.filter(c => c.pages.some(p => p.includes('calculadora'))).length,
        percentage: 0
      },
      {
        stage: 'Intención (contacto)',
        count: companies.filter(c => c.pages.some(p => p.includes('contacto'))).length,
        percentage: 0
      },
      {
        stage: 'Leads calientes (score ≥ 70)',
        count: companies.filter(c => this.calculateLeadScore(c.domain) >= 70).length,
        percentage: 0
      }
    ];

    // Calculate percentages
    stages.forEach(stage => {
      stage.percentage = total > 0 ? Math.round((stage.count / total) * 100) : 0;
    });

    return stages;
  }

  private getTopEvents(): Array<{name: string, count: number}> {
    const eventCounts = new Map<string, number>();
    
    this.events.forEach(event => {
      eventCounts.set(event.name, (eventCounts.get(event.name) || 0) + 1);
    });

    return Array.from(eventCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Singleton instance
let analyticsInstance: AnalyticsManager | null = null;

export const initAnalytics = (config: AnalyticsConfig): AnalyticsManager => {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager(config);
  }
  return analyticsInstance;
};

export const getAnalytics = (): AnalyticsManager | null => {
  return analyticsInstance;
};
