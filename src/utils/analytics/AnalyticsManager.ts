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
  facebookPixelId?: string;
  enableCompanyTracking?: boolean;
  enableEnrichment?: boolean;
  enableAlerting?: boolean;
  enableAttribution?: boolean;
}

import { CompanyEnrichmentService, LeadIntelligence } from './CompanyEnrichment';
import { LeadScoringEngine } from './LeadScoringEngine';
import { AlertingSystem } from './AlertingSystem';
import { AttributionEngine, TouchPoint } from './AttributionEngine';

export class AnalyticsManager {
  private config: AnalyticsConfig;
  private events: AnalyticsEvent[] = [];
  private companies: Map<string, CompanyData> = new Map();
  private enrichmentService: CompanyEnrichmentService;
  private scoringEngine: LeadScoringEngine;
  private alertingSystem: AlertingSystem;
  private attributionEngine: AttributionEngine;
  private leadIntelligence: Map<string, LeadIntelligence> = new Map();
  private currentSessionId: string;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.enrichmentService = new CompanyEnrichmentService();
    this.scoringEngine = new LeadScoringEngine();
    this.alertingSystem = new AlertingSystem();
    this.attributionEngine = new AttributionEngine();
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.init();
  }

  private init() {
    if (this.config.ga4MeasurementId) {
      this.initGA4(this.config.ga4MeasurementId);
    }
    
    if (this.config.clarityProjectId) {
      this.initClarity(this.config.clarityProjectId);
    }

    if (this.config.facebookPixelId) {
      this.initFacebookPixel(this.config.facebookPixelId);
    }

    if (this.config.leadfeederTrackingId && this.config.enableCompanyTracking) {
      this.initCompanyTracking(this.config.leadfeederTrackingId);
    }

    // Track page views automatically
    this.trackPageView();
  }

  // Google Analytics 4 Integration
  private initGA4(measurementId: string) {
    try {
      console.log('🟡 Initializing Google Analytics 4 with ID:', measurementId);
      
      // Initialize dataLayer first
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = gtag;

      // Load GA4 script with proper error handling
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.onerror = () => {
        console.error('❌ Failed to load Google Analytics script');
      };
      script.onload = () => {
        console.log('✅ Google Analytics script loaded successfully');
        
        // Configure GA4 after script loads
        gtag('js', new Date());
        gtag('config', measurementId, {
          page_title: document.title,
          page_location: window.location.href,
          send_page_view: true // Enable automatic page view
        });
        
        console.log('✅ Google Analytics 4 configured successfully');
      };
      
      document.head.appendChild(script);

      // Add global GA status for monitoring
      (window as any).gaStatus = {
        initialized: true,
        measurementId: measurementId,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error initializing Google Analytics:', error);
    }
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

  // Facebook Pixel Integration
  private initFacebookPixel(pixelId: string) {
    try {
      // Check if pixel is already initialized from HTML
      if ((window as any).fbPixelStatus?.loadedFromHTML) {
        console.log('🔄 Facebook Pixel already loaded from HTML, verifying configuration');
        
        // Verify the pixel ID matches
        if ((window as any).fbPixelStatus.pixelId === pixelId) {
          console.log('✅ Facebook Pixel HTML configuration matches, no additional setup needed');
          return;
        } else {
          console.warn('⚠️ Pixel ID mismatch - HTML:', (window as any).fbPixelStatus.pixelId, 'Config:', pixelId);
        }
      }

      // Check if fbq exists but wasn't loaded from HTML
      if ((window as any).fbq && (window as any).fbq.loaded) {
        console.log('🔄 Facebook Pixel already initialized, skipping duplicate initialization');
        return;
      }

      // Initialize Facebook Pixel if not already loaded
      if (!(window as any).fbq) {
        (window as any).fbq = function() {
          ((window as any).fbq.q = (window as any).fbq.q || []).push(arguments);
        };
        (window as any)._fbq = (window as any).fbq;
        (window as any).fbq.version = '2.0';
        (window as any).fbq.queue = [];

        // Enhanced script loading with error handling
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        script.onerror = () => {
          console.error('❌ Failed to load Facebook Pixel script');
          (window as any).fbq.loadError = true;
        };
        script.onload = () => {
          console.log('✅ Facebook Pixel script loaded successfully');
          (window as any).fbq.loaded = true;
        };
        document.head.appendChild(script);
      }

      // Initialize pixel with ID
      (window as any).fbq('init', pixelId);
      
      // Track PageView if not already tracked from HTML
      if (!(window as any).fbPixelStatus?.loadedFromHTML) {
        (window as any).fbq('track', 'PageView');
      }

      // Update global pixel status
      (window as any).fbPixelStatus = {
        ...(window as any).fbPixelStatus,
        initialized: true,
        pixelId: pixelId,
        timestamp: new Date().toISOString(),
        loadedFromAnalytics: true
      };

      console.log('✅ Facebook Pixel initialized successfully with ID:', pixelId);
      
      // Verify pixel is working after a short delay
      setTimeout(() => {
        if ((window as any).fbq && !(window as any).fbq.loadError) {
          console.log('🔍 Facebook Pixel verification: WORKING');
        } else {
          console.warn('⚠️ Facebook Pixel verification: ISSUES DETECTED');
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Error initializing Facebook Pixel:', error);
      (window as any).fbPixelStatus = {
        ...(window as any).fbPixelStatus,
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Facebook Pixel Event Tracking
  private trackFacebookEvent(eventName: string, properties: Record<string, any>) {
    try {
      // Enhanced validation
      if (!(window as any).fbq) {
        console.warn('⚠️ Facebook Pixel not initialized, event skipped:', eventName);
        return;
      }

      if ((window as any).fbq.loadError) {
        console.warn('⚠️ Facebook Pixel script failed to load, event skipped:', eventName);
        return;
      }

      // Map generic events to Facebook Pixel standard events
      let facebookEventName = eventName;
      let eventData = { ...properties };

      switch (eventName) {
        case 'calculator_used':
        case 'valuation_calculated':
          facebookEventName = 'InitiateCheckout';
          eventData = {
            content_name: 'Calculadora de Valoración',
            content_category: 'Herramientas',
            value: properties.eventValue || 1500,
            currency: 'EUR'
          };
          break;
        
        case 'form_submit':
        case 'contact_form_submit':
          facebookEventName = 'Lead';
          eventData = {
            content_name: 'Formulario de Contacto',
            content_category: 'Leads',
            value: properties.eventValue || 2000,
            currency: 'EUR'
          };
          break;
        
        case 'pdf_download':
        case 'resource_download':
          facebookEventName = 'ViewContent';
          eventData = {
            content_name: properties.resourceName || 'Recurso descargado',
            content_category: 'Recursos',
            content_type: 'pdf'
          };
          break;
        
        case 'page_view':
          facebookEventName = 'PageView';
          eventData = {};
          break;
        
        case 'contact_clicked':
        case 'phone_clicked':
          facebookEventName = 'Contact';
          eventData = {
            content_name: 'Contacto directo',
            content_category: 'Contacto'
          };
          break;
        
        default:
          // Use custom event for unmatched events
          facebookEventName = eventName;
          break;
      }

      // Track the event with Facebook Pixel with error handling
      (window as any).fbq('track', facebookEventName, eventData);
      
      console.log('📊 Facebook Pixel event tracked successfully:', facebookEventName, eventData);
      
      // Update last event timestamp for monitoring
      if ((window as any).fbPixelStatus) {
        (window as any).fbPixelStatus.lastEventTime = new Date().toISOString();
        (window as any).fbPixelStatus.totalEvents = ((window as any).fbPixelStatus.totalEvents || 0) + 1;
      }

    } catch (error) {
      console.error('❌ Error tracking Facebook Pixel event:', error, { eventName, properties });
    }
  }

  // Company Intelligence Tracking
  private initCompanyTracking(trackingId: string) {
    // Simulate company detection based on IP/domain patterns
    this.detectVisitingCompany();
    
    console.log('Company tracking initialized with ID:', trackingId);
  }

  // Enhanced Event Tracking with Attribution
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

    // Enhanced attribution tracking
    if (this.config.enableAttribution) {
      this.trackAttributionTouchPoint(eventName, properties);
    }

    // Send to GA4
    if (this.config.ga4MeasurementId && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }

    // Send to Clarity
    if (this.config.clarityProjectId && (window as any).clarity) {
      (window as any).clarity('event', eventName);
    }

    // Send to Facebook Pixel
    if (this.config.facebookPixelId && (window as any).fbq) {
      this.trackFacebookEvent(eventName, properties);
    }

    console.log('Event tracked:', event);
  }

  private trackAttributionTouchPoint(eventName: string, properties: Record<string, any>) {
    // Extract attribution data from URL parameters or referrer
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
    
    let channel = 'Direct';
    let source = 'direct';
    let medium = 'none';
    let campaign = undefined;

    // Detect channel from URL parameters
    if (urlParams.get('utm_source')) {
      source = urlParams.get('utm_source') || 'unknown';
      medium = urlParams.get('utm_medium') || 'unknown';
      campaign = urlParams.get('utm_campaign') || undefined;
      
      if (medium.includes('cpc') || medium.includes('ppc')) {
        channel = 'Paid Search';
      } else if (medium.includes('social')) {
        channel = 'Social Media';
      } else if (medium.includes('email')) {
        channel = 'Email';
      } else {
        channel = 'Other';
      }
    } else if (referrer) {
      // Detect channel from referrer
      if (referrer.includes('google.')) {
        channel = 'SEO';
        source = 'google';
        medium = 'organic';
      } else if (referrer.includes('linkedin.')) {
        channel = 'LinkedIn';
        source = 'linkedin';
        medium = 'social';
      } else if (referrer.includes('facebook.')) {
        channel = 'Facebook';
        source = 'facebook';
        medium = 'social';
      } else {
        channel = 'Referral';
        source = 'referral';
        medium = 'referral';
      }
    }

    // Determine event type
    let eventType: TouchPoint['eventType'] = 'page_view';
    if (eventName === 'form_submit' || eventName === 'contact_form_submit') {
      eventType = 'form_submission';
    } else if (eventName === 'calculator_used' || eventName === 'valuation_calculated') {
      eventType = 'calculator_use';
    } else if (eventName === 'pdf_download' || eventName === 'resource_download') {
      eventType = 'download';
    } else if (eventName === 'contact_clicked' || eventName === 'phone_clicked') {
      eventType = 'contact';
    }

    const touchPoint: TouchPoint = {
      id: `touch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      channel,
      source,
      medium,
      campaign,
      content: urlParams.get('utm_content') || undefined,
      page: window.location.pathname,
      companyDomain: properties.companyDomain || 'unknown.com',
      sessionId: this.currentSessionId,
      eventType,
      value: properties.value || (eventType === 'form_submission' ? 1500 : undefined)
    };

    this.attributionEngine.addTouchPoint(touchPoint);
  }

  // Page View Tracking
  trackPageView(path?: string) {
    const currentPath = path || window.location.pathname;
    
    // Enhanced page view tracking
    if (this.config.ga4MeasurementId && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: currentPath
      });
      console.log('📊 GA4 page view tracked:', currentPath);
    }
    
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
      lead_score: this.calculateLeadScore(companyData.domain),
      companyDomain: companyData.domain // For attribution tracking
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

  // New Attribution Methods
  getAttributionReport(modelType: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' = 'linear', dateRange?: { start: Date; end: Date }) {
    return this.attributionEngine.getAttributionReport(modelType, dateRange);
  }

  getFunnelAnalysis() {
    return this.attributionEngine.getFunnelAnalysis();
  }

  getCustomerJourneyMap() {
    return this.attributionEngine.getCustomerJourneyMap();
  }

  getConversionPaths() {
    return this.attributionEngine.getAllConversionPaths();
  }

  getTouchPoints() {
    return this.attributionEngine.getAllTouchPoints();
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

  // Enhanced Analytics Summary with Attribution Data
  getAnalyticsSummary() {
    const events = this.getEvents();
    const companies = this.getCompanies();
    const leadIntelligence = this.getAllLeadIntelligence();
    const alerts = this.getAlerts({ isRead: false });
    const attributionReport = this.getAttributionReport();
    const funnelAnalysis = this.getFunnelAnalysis();
    
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
      conversionFunnel: this.getConversionFunnel(),
      // New Attribution Data
      attribution: {
        totalConversions: attributionReport?.totalConversions || 0,
        totalAttributedValue: attributionReport?.totalValue || 0,
        topChannels: attributionReport?.channelPerformance?.slice(0, 5) || [],
        averagePathLength: attributionReport?.averagePathLength || 0,
        conversionRate: funnelAnalysis?.conversionRate || 0
      }
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
