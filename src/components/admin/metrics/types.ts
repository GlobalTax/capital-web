// ============= LEAD METRICS TYPES =============

import { ContactStatus } from '@/hooks/useContactStatuses';

// Lead source types for filtering
export type LeadType = 'valoracion' | 'compra' | 'venta' | 'otro' | 'all';

// Campaign types for analysis
export type CampaignType = 'Meta Ads' | 'Google Ads' | 'Orgánico' | 'Referido' | 'Directo' | 'Otro';

// Status distribution data
export interface StatusDistribution {
  status_key: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  position: number;
}

// Funnel stage data
export interface FunnelStage {
  status_key: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number; // % from previous stage
  conversionFromFirst: number;    // % from first stage
  position: number;
  isTerminal: boolean;            // Ganado, Perdido, etc.
}

// State transition data
export interface StateTransition {
  fromStatus: string;
  fromLabel: string;
  toStatus: string;
  toLabel: string;
  count: number;
  percentage: number;
  avgDaysInState?: number;
}

// Lead quality metrics per campaign
export interface CampaignQuality {
  campaign: string;
  totalLeads: number;
  qualifiedPercentage: number;      // % that reached qualified state
  discardedPercentage: number;      // % that ended in discard states
  meetingPercentage: number;        // % that reached meeting stage
  pshPercentage: number;            // % that reached PSH stage
  wonPercentage: number;            // % that reached won stage
  avgConversionDepth: number;       // Average funnel depth reached
}

// Temporal evolution data
export interface TemporalDataPoint {
  date: string;
  newLeads: number;
  qualifiedLeads: number;
  meetingLeads: number;
  wonLeads: number;
}

// Complete metrics state
export interface LeadMetricsData {
  statusDistribution: StatusDistribution[];
  funnel: FunnelStage[];
  transitions: StateTransition[];
  campaignQuality: CampaignQuality[];
  temporalEvolution: TemporalDataPoint[];
  totals: {
    totalLeads: number;
    activeLeads: number;
    wonLeads: number;
    lostLeads: number;
  };
}

// Terminal states that end the funnel
export const TERMINAL_STATUS_KEYS = ['ganado', 'perdido', 'archivado', 'lead_perdido_curiosidad', 'mandato_propuesto', 'ya_advisor'];

// Qualified states (consider lead as "good")
export const QUALIFIED_STATUS_KEYS = ['en_espera', 'fase0_activo', 'mandato_firmado', 'archivado', 'ganado'];

// Meeting states
export const MEETING_STATUS_KEYS = ['fase0_activo', 'mandato_firmado'];

// PSH/Proposal states
export const PSH_STATUS_KEYS = ['archivado']; // PSH Enviada

// Won states
export const WON_STATUS_KEYS = ['ganado'];

// Discard states
export const DISCARD_STATUS_KEYS = ['perdido', 'lead_perdido_curiosidad', 'mandato_propuesto', 'ya_advisor'];

// Helper to determine lead type from origin
export const getLeadTypeFromOrigin = (origin: string): LeadType => {
  const lowerOrigin = origin.toLowerCase();
  if (lowerOrigin.includes('valuation') || lowerOrigin.includes('valoración') || lowerOrigin.includes('valoracion')) {
    return 'valoracion';
  }
  if (lowerOrigin.includes('compra') || lowerOrigin.includes('buyer') || lowerOrigin.includes('acquisition')) {
    return 'compra';
  }
  if (lowerOrigin.includes('venta') || lowerOrigin.includes('seller')) {
    return 'venta';
  }
  return 'otro';
};

// Helper to map status key to label using statuses array
export const getStatusLabel = (statusKey: string, statuses: ContactStatus[]): string => {
  const found = statuses.find(s => s.status_key === statusKey);
  return found?.label || statusKey;
};

// Helper to get status color
export const getStatusColor = (statusKey: string, statuses: ContactStatus[]): string => {
  const found = statuses.find(s => s.status_key === statusKey);
  return found?.color || 'gray';
};
