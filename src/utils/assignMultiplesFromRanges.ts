import { supabase } from '@/integrations/supabase/client';

export interface RangeAssignment {
  multiple_low: number;
  multiple_mid: number;
  multiple_high: number;
  range_label: string | null;
  is_auto_assigned: boolean;
}

export interface ValuationRange {
  id: string;
  campaign_id: string;
  range_order: number;
  min_value: number | null;
  max_value: number | null;
  multiple_low: number;
  multiple_mid: number;
  multiple_high: number;
  range_label: string | null;
}

/**
 * Find matching range from pre-fetched ranges (no DB call).
 * Returns null if no ranges are defined.
 */
export function findMatchingRange(
  baseValue: number,
  ranges: ValuationRange[]
): RangeAssignment | null {
  if (!ranges || ranges.length === 0) return null;

  for (const range of ranges) {
    const meetsMin = range.min_value === null || baseValue >= range.min_value;
    const meetsMax = range.max_value === null || baseValue < range.max_value;

    if (meetsMin && meetsMax) {
      return {
        multiple_low: range.multiple_low,
        multiple_mid: range.multiple_mid,
        multiple_high: range.multiple_high,
        range_label: range.range_label,
        is_auto_assigned: true,
      };
    }
  }

  // Fallback to last range
  const last = ranges[ranges.length - 1];
  return {
    multiple_low: last.multiple_low,
    multiple_mid: last.multiple_mid,
    multiple_high: last.multiple_high,
    range_label: last.range_label,
    is_auto_assigned: true,
  };
}

/**
 * Fetch ranges for a campaign from DB.
 */
export async function fetchCampaignRanges(campaignId: string): Promise<ValuationRange[]> {
  const { data, error } = await supabase
    .from('valuation_ranges')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('range_order');

  if (error) {
    console.error('[RANGES] Error fetching ranges:', error);
    return [];
  }

  return (data || []) as unknown as ValuationRange[];
}
