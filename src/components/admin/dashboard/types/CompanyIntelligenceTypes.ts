
import { CompanyData } from '@/utils/analytics/AnalyticsManager';

export interface CompanyVisit {
  companyName: string;
  industry: string;
  size: string;
  location: string;
  pagesVisited: string[];
  timeOnSite: number;
  leadScore: number;
  lastVisit: Date;
  domain: string;
  visitCount: number;
  engagementScore: number;
}

export interface CompanyIntelligenceProps {
  limit?: number;
  showFilters?: boolean;
}

export const adaptCompanyData = (company: CompanyData): CompanyVisit => ({
  companyName: company.name,
  industry: company.industry || 'Desconocido',
  size: company.size || 'No especificado',
  location: company.location || 'No especificado',
  pagesVisited: [], // CompanyData doesn't have this property, so we use empty array
  timeOnSite: 0, // CompanyData doesn't have this property, so we use 0
  leadScore: company.engagementScore || 0,
  lastVisit: new Date(company.lastVisit),
  domain: company.domain,
  visitCount: company.visitCount || 1,
  engagementScore: company.engagementScore || 0
});

export const getLeadScoreBadgeVariant = (score: number) => {
  if (score >= 80) return 'default';
  if (score >= 50) return 'secondary';
  return 'outline';
};

export const formatTimeOnSite = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};
