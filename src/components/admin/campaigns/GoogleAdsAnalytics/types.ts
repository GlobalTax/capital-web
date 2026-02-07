// ============= GOOGLE ADS ANALYTICS TYPES =============

import { AdsCostRecord } from '@/hooks/useAdsCostsHistory';

export interface GoogleAdsCampaignStats {
  campaignName: string;
  totalSpend: number;
  totalClicks: number;
  totalConversions: number;
  activeDays: number;
  avgCpc: number;
  avgCpa: number;
  avgCpm: number;
  avgCtr: number; // stored as percentage (e.g. 7.35)
  percentOfTotal: number;
  records: AdsCostRecord[];
}

export interface GoogleAdsGlobalStats {
  totalSpend: number;
  totalClicks: number;
  totalConversions: number;
  activeDays: number;
  avgSpendPerDay: number;
  avgCpc: number;
  avgCpa: number;
  avgCpm: number;
  avgCtr: number;
}

export interface GoogleAdsDailyPoint {
  date: string;
  spend: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpa: number;
  cpm: number;
  ctr: number;
}

// Safe division
const safeDivide = (a: number, b: number): number => (b > 0 ? a / b : 0);

export const analyzeGoogleAdsData = (records: AdsCostRecord[]): {
  global: GoogleAdsGlobalStats;
  campaigns: GoogleAdsCampaignStats[];
} => {
  const totalSpend = records.reduce((s, r) => s + (r.spend || 0), 0);
  const totalClicks = records.reduce((s, r) => s + (r.clicks || 0), 0);
  const totalConversions = records.reduce((s, r) => s + (r.conversions || r.results || 0), 0);
  const uniqueDates = new Set(records.map(r => r.date));

  // Average CTR from raw_row if available
  const ctrValues = records
    .map(r => (r.raw_row as any)?._ctr_percent)
    .filter((v): v is number => typeof v === 'number');
  const avgCtr = ctrValues.length > 0 ? ctrValues.reduce((a, b) => a + b, 0) / ctrValues.length : 0;

  // Average CPM from cpm field
  const cpmValues = records.filter(r => r.cpm != null).map(r => r.cpm!);
  const avgCpm = cpmValues.length > 0 ? cpmValues.reduce((a, b) => a + b, 0) / cpmValues.length : 0;

  const global: GoogleAdsGlobalStats = {
    totalSpend,
    totalClicks,
    totalConversions,
    activeDays: uniqueDates.size,
    avgSpendPerDay: safeDivide(totalSpend, uniqueDates.size),
    avgCpc: safeDivide(totalSpend, totalClicks),
    avgCpa: safeDivide(totalSpend, totalConversions),
    avgCpm,
    avgCtr,
  };

  // Group by campaign
  const groups = new Map<string, AdsCostRecord[]>();
  for (const r of records) {
    const name = r.campaign_name;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name)!.push(r);
  }

  const campaigns: GoogleAdsCampaignStats[] = [];
  for (const [name, recs] of groups) {
    const spend = recs.reduce((s, r) => s + (r.spend || 0), 0);
    const clicks = recs.reduce((s, r) => s + (r.clicks || 0), 0);
    const convs = recs.reduce((s, r) => s + (r.conversions || r.results || 0), 0);
    const days = new Set(recs.map(r => r.date)).size;

    const campCtr = recs
      .map(r => (r.raw_row as any)?._ctr_percent)
      .filter((v): v is number => typeof v === 'number');

    const campCpm = recs.filter(r => r.cpm != null).map(r => r.cpm!);

    campaigns.push({
      campaignName: name,
      totalSpend: spend,
      totalClicks: clicks,
      totalConversions: convs,
      activeDays: days,
      avgCpc: safeDivide(spend, clicks),
      avgCpa: safeDivide(spend, convs),
      avgCpm: campCpm.length > 0 ? campCpm.reduce((a, b) => a + b, 0) / campCpm.length : 0,
      avgCtr: campCtr.length > 0 ? campCtr.reduce((a, b) => a + b, 0) / campCtr.length : 0,
      percentOfTotal: safeDivide(spend, totalSpend) * 100,
      records: recs,
    });
  }

  campaigns.sort((a, b) => b.totalSpend - a.totalSpend);

  return { global, campaigns };
};

export const getGoogleAdsDailyEvolution = (records: AdsCostRecord[]): GoogleAdsDailyPoint[] => {
  const groups = new Map<string, AdsCostRecord[]>();
  for (const r of records) {
    if (!groups.has(r.date)) groups.set(r.date, []);
    groups.get(r.date)!.push(r);
  }

  const points: GoogleAdsDailyPoint[] = [];
  for (const [date, recs] of groups) {
    const spend = recs.reduce((s, r) => s + (r.spend || 0), 0);
    const clicks = recs.reduce((s, r) => s + (r.clicks || 0), 0);
    const convs = recs.reduce((s, r) => s + (r.conversions || r.results || 0), 0);

    const ctrVals = recs.map(r => (r.raw_row as any)?._ctr_percent).filter((v): v is number => typeof v === 'number');
    const cpmVals = recs.filter(r => r.cpm != null).map(r => r.cpm!);

    points.push({
      date,
      spend,
      clicks,
      conversions: convs,
      cpc: safeDivide(spend, clicks),
      cpa: safeDivide(spend, convs),
      cpm: cpmVals.length > 0 ? cpmVals.reduce((a, b) => a + b, 0) / cpmVals.length : 0,
      ctr: ctrVals.length > 0 ? ctrVals.reduce((a, b) => a + b, 0) / ctrVals.length : 0,
    });
  }

  return points.sort((a, b) => a.date.localeCompare(b.date));
};
