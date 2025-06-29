
export interface CompanyEnrichmentData {
  name: string;
  domain: string;
  industry?: string;
  size?: string;
  location?: string;
  revenue?: string;
  employees?: string;
  description?: string;
  technologies?: string[];
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  fundingInfo?: {
    totalFunding?: string;
    lastRound?: string;
    investors?: string[];
  };
}

export interface LeadIntelligence {
  companyData: CompanyEnrichmentData;
  visitData: {
    firstVisit: Date;
    lastVisit: Date;
    totalVisits: number;
    pagesViewed: string[];
    timeOnSite: number;
    deviceTypes: string[];
    referralSources: string[];
  };
  engagementScore: number;
  intentScore: number;
  fitScore: number;
  overallScore: number;
  triggers: string[];
  nextActions: string[];
}

export class CompanyEnrichmentService {
  private cache: Map<string, CompanyEnrichmentData> = new Map();

  async enrichCompanyData(domain: string): Promise<CompanyEnrichmentData | null> {
    // Check cache first
    if (this.cache.has(domain)) {
      return this.cache.get(domain)!;
    }

    try {
      // Simulate API calls to enrichment services
      // In production, this would integrate with:
      // - Clearbit
      // - ZoomInfo
      // - Apollo
      // - Hunter.io
      // - BuiltWith (for technology stack)
      
      const enrichedData = await this.mockEnrichmentAPI(domain);
      
      if (enrichedData) {
        this.cache.set(domain, enrichedData);
      }
      
      return enrichedData;
    } catch (error) {
      console.error('Error enriching company data:', error);
      return null;
    }
  }

  private async mockEnrichmentAPI(domain: string): Promise<CompanyEnrichmentData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data for demonstration
    const mockData: Record<string, CompanyEnrichmentData> = {
      'empresademo.com': {
        name: 'Empresa Demo S.L.',
        domain: 'empresademo.com',
        industry: 'Technology',
        size: '50-200 employees',
        location: 'Madrid, España',
        revenue: '€5M - €10M',
        employees: '125',
        description: 'Empresa líder en soluciones tecnológicas para el sector financiero',
        technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL'],
        socialProfiles: {
          linkedin: 'https://linkedin.com/company/empresademo',
          website: 'https://empresademo.com'
        },
        fundingInfo: {
          totalFunding: '€2.5M',
          lastRound: 'Series A',
          investors: ['Venture Capital Firm', 'Angel Investor Group']
        }
      },
      'techstartup.com': {
        name: 'TechStartup Inc.',
        domain: 'techstartup.com',
        industry: 'FinTech',
        size: '10-50 employees',
        location: 'Barcelona, España',
        revenue: '€1M - €5M',
        employees: '35',
        description: 'Startup innovadora en pagos digitales',
        technologies: ['Vue.js', 'Python', 'Docker', 'MongoDB'],
        socialProfiles: {
          linkedin: 'https://linkedin.com/company/techstartup',
          website: 'https://techstartup.com'
        }
      }
    };

    return mockData[domain] || {
      name: `Empresa ${domain}`,
      domain: domain,
      industry: 'Unknown',
      size: 'Unknown',
      location: 'España'
    };
  }

  async getCompanyTechnologies(domain: string): Promise<string[]> {
    // Mock BuiltWith-like technology detection
    const techStacks: Record<string, string[]> = {
      'empresademo.com': ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Stripe'],
      'techstartup.com': ['Vue.js', 'Python', 'Docker', 'MongoDB', 'PayPal']
    };

    return techStacks[domain] || ['JavaScript', 'HTML', 'CSS'];
  }
}
