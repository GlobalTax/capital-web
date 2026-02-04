// ============= META ADS ANALYTICS TYPES =============

import { AdsCostRecord } from '@/hooks/useAdsCostsHistory';

// The 4 core campaigns to track separately
export const CORE_CAMPAIGNS = [
  'Generación de clientes potenciales (Valoración)',
  'Valoración de Empresas Q4 - API + Navegador',
  'Generación de clientes potenciales - Venta',
  'Generación de clientes potenciales - Compra',
] as const;

export type CoreCampaignName = typeof CORE_CAMPAIGNS[number];

// Normalized campaign matching
export const normalizeCampaignName = (name: string): string => {
  return name.toLowerCase().trim();
};

export const matchCoreCampaign = (name: string): CoreCampaignName | 'other' => {
  const normalized = normalizeCampaignName(name);
  
  for (const core of CORE_CAMPAIGNS) {
    if (normalizeCampaignName(core) === normalized) {
      return core;
    }
    // Fuzzy matching for common variations
    if (normalized.includes('valoración') && normalized.includes('generación')) {
      return 'Generación de clientes potenciales (Valoración)';
    }
    if (normalized.includes('q4') && normalized.includes('api')) {
      return 'Valoración de Empresas Q4 - API + Navegador';
    }
    if (normalized.includes('venta') && normalized.includes('generación')) {
      return 'Generación de clientes potenciales - Venta';
    }
    if (normalized.includes('compra') && normalized.includes('generación')) {
      return 'Generación de clientes potenciales - Compra';
    }
  }
  
  return 'other';
};

export interface CampaignStats {
  campaignName: string;
  totalSpend: number;
  totalResults: number;
  totalImpressions: number;
  totalClicks: number;
  totalReach: number;
  activeDays: number;
  avgCostPerResult: number;
  avgCpm: number; // Weighted by impressions
  avgFrequency: number;
  percentOfTotal: number;
  records: AdsCostRecord[];
  // Real leads data
  totalRealLeads: number;
  totalQualifiedLeads: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
}

export interface GlobalStats {
  totalSpend: number;
  activeDays: number;
  avgSpendPerDay: number;
  totalResults: number;
  totalImpressions: number;
  avgCostPerResult: number;
  avgCpm: number; // Weighted
  avgFrequency: number;
  totalClicks: number;
  avgCpc: number;
  // Real leads data
  totalRealLeads: number;
  totalQualifiedLeads: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
}

export interface DailyDataPoint {
  date: string;
  spend: number;
  results: number;
  costPerResult: number;
  impressions: number;
  cpm: number;
  frequency: number;
  clicks: number;
}

export interface CampaignAnalysis {
  core: Map<CoreCampaignName, CampaignStats>;
  other: CampaignStats | null;
  global: GlobalStats;
}

// Calculate weighted CPM
export const calculateWeightedCpm = (records: AdsCostRecord[]): number => {
  const totalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const totalSpend = records.reduce((sum, r) => sum + (r.spend || 0), 0);
  
  if (totalImpressions === 0) return 0;
  return (totalSpend / totalImpressions) * 1000;
};

// Calculate weighted frequency
export const calculateWeightedFrequency = (records: AdsCostRecord[]): number => {
  const totalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const totalReach = records.reduce((sum, r) => sum + (r.reach || 0), 0);
  
  if (totalReach === 0) return 0;
  return totalImpressions / totalReach;
};

// Calculate stats for a set of records
export const calculateCampaignStats = (
  campaignName: string,
  records: AdsCostRecord[],
  globalSpend: number
): CampaignStats => {
  const totalSpend = records.reduce((sum, r) => sum + (r.spend || 0), 0);
  const totalResults = records.reduce((sum, r) => sum + (r.results || r.conversions || 0), 0);
  const totalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const totalClicks = records.reduce((sum, r) => sum + (r.link_clicks || r.clicks || 0), 0);
  const totalReach = records.reduce((sum, r) => sum + (r.reach || 0), 0);
  
  const uniqueDates = new Set(records.map(r => r.date));
  const activeDays = uniqueDates.size;
  
  return {
    campaignName,
    totalSpend,
    totalResults,
    totalImpressions,
    totalClicks,
    totalReach,
    activeDays,
    avgCostPerResult: totalResults > 0 ? totalSpend / totalResults : 0,
    avgCpm: calculateWeightedCpm(records),
    avgFrequency: calculateWeightedFrequency(records),
    percentOfTotal: globalSpend > 0 ? (totalSpend / globalSpend) * 100 : 0,
    records,
    // Real leads data - populated separately via useUnifiedCosts
    totalRealLeads: 0,
    totalQualifiedLeads: 0,
    realCPL: null,
    qualifiedCPL: null,
    avgEbitda: null,
  };
};

// Main analysis function
export const analyzeMetaAdsData = (records: AdsCostRecord[]): CampaignAnalysis => {
  // Global totals first
  const globalSpend = records.reduce((sum, r) => sum + (r.spend || 0), 0);
  const globalResults = records.reduce((sum, r) => sum + (r.results || r.conversions || 0), 0);
  const globalImpressions = records.reduce((sum, r) => sum + (r.impressions || 0), 0);
  const globalClicks = records.reduce((sum, r) => sum + (r.link_clicks || r.clicks || 0), 0);
  const uniqueDates = new Set(records.map(r => r.date));
  
  const global: GlobalStats = {
    totalSpend: globalSpend,
    activeDays: uniqueDates.size,
    avgSpendPerDay: uniqueDates.size > 0 ? globalSpend / uniqueDates.size : 0,
    totalResults: globalResults,
    totalImpressions: globalImpressions,
    avgCostPerResult: globalResults > 0 ? globalSpend / globalResults : 0,
    avgCpm: calculateWeightedCpm(records),
    avgFrequency: calculateWeightedFrequency(records),
    totalClicks: globalClicks,
    avgCpc: globalClicks > 0 ? globalSpend / globalClicks : 0,
    // Real leads data - populated separately via useUnifiedCosts
    totalRealLeads: 0,
    totalQualifiedLeads: 0,
    realCPL: null,
    qualifiedCPL: null,
    avgEbitda: null,
  };
  
  // Group by campaign
  const campaignGroups = new Map<string, AdsCostRecord[]>();
  const otherRecords: AdsCostRecord[] = [];
  
  for (const record of records) {
    const matchedCampaign = matchCoreCampaign(record.campaign_name);
    
    if (matchedCampaign === 'other') {
      otherRecords.push(record);
    } else {
      const existing = campaignGroups.get(matchedCampaign) || [];
      existing.push(record);
      campaignGroups.set(matchedCampaign, existing);
    }
  }
  
  // Calculate stats for core campaigns
  const core = new Map<CoreCampaignName, CampaignStats>();
  for (const campaignName of CORE_CAMPAIGNS) {
    const campaignRecords = campaignGroups.get(campaignName) || [];
    if (campaignRecords.length > 0) {
      core.set(campaignName, calculateCampaignStats(campaignName, campaignRecords, globalSpend));
    }
  }
  
  // Calculate stats for "other" campaigns
  const other = otherRecords.length > 0 
    ? calculateCampaignStats('Otras campañas', otherRecords, globalSpend)
    : null;
  
  return { core, other, global };
};

// Get daily evolution data
export const getDailyEvolution = (records: AdsCostRecord[]): DailyDataPoint[] => {
  // Group by date
  const dateGroups = new Map<string, AdsCostRecord[]>();
  
  for (const record of records) {
    const existing = dateGroups.get(record.date) || [];
    existing.push(record);
    dateGroups.set(record.date, existing);
  }
  
  // Calculate daily stats
  const dailyData: DailyDataPoint[] = [];
  
  for (const [date, dayRecords] of dateGroups) {
    const spend = dayRecords.reduce((sum, r) => sum + (r.spend || 0), 0);
    const results = dayRecords.reduce((sum, r) => sum + (r.results || r.conversions || 0), 0);
    const impressions = dayRecords.reduce((sum, r) => sum + (r.impressions || 0), 0);
    const clicks = dayRecords.reduce((sum, r) => sum + (r.link_clicks || r.clicks || 0), 0);
    
    dailyData.push({
      date,
      spend,
      results,
      costPerResult: results > 0 ? spend / results : 0,
      impressions,
      cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
      frequency: calculateWeightedFrequency(dayRecords),
      clicks,
    });
  }
  
  // Sort by date ascending for charts
  return dailyData.sort((a, b) => a.date.localeCompare(b.date));
};
