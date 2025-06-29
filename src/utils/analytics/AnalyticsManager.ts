
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
}

export class AnalyticsManager {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private companies: Map<string, CompanyData> = new Map();

  constructor(config: AnalyticsConfig) {
    this.config = config;
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
    const company = this.companies.get(companyDomain);
    if (!company) return 0;

    let score = 0;
    
    // Visit frequency (max 30 points)
    score += Math.min(company.visitCount * 5, 30);
    
    // Page depth (max 25 points)
    score += Math.min(company.pages.length * 3, 25);
    
    // Engagement time (max 25 points)
    score += Math.min(company.engagementScore, 25);
    
    // Industry relevance (max 20 points)
    if (company.industry && ['Technology', 'Finance', 'Healthcare', 'Manufacturing'].includes(company.industry)) {
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

  // Company Identification
  identifyCompany(companyData: CompanyData) {
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

    // Track company visit event
    this.trackEvent('company_identified', {
      company_name: companyData.name,
      company_domain: companyData.domain,
      company_industry: companyData.industry,
      lead_score: this.calculateLeadScore(companyData.domain)
    });

    console.log('Company identified:', companyData);
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
    
    return {
      totalEvents: events.length,
      totalCompanies: companies.length,
      topEvents: this.getTopEvents(),
      recentActivity: events.slice(-10).reverse(),
      leadScore: {
        high: companies.filter(c => this.calculateLeadScore(c.domain) >= 70).length,
        medium: companies.filter(c => this.calculateLeadScore(c.domain) >= 40 && this.calculateLeadScore(c.domain) < 70).length,
        low: companies.filter(c => this.calculateLeadScore(c.domain) < 40).length
      }
    };
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
