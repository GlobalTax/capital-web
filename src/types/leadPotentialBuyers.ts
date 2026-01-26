export type BuyerStatus = 'identificado' | 'contactado' | 'interesado' | 'negociando' | 'descartado';

export interface LeadPotentialBuyer {
  id: string;
  lead_id: string;
  lead_origin: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sector_focus: string[] | null;
  revenue_range: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  priority: number;
  status: BuyerStatus;
  notes: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadPotentialBuyerFormData {
  name: string;
  logo_url?: string;
  website?: string;
  description?: string;
  sector_focus?: string[];
  revenue_range?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  priority?: number;
  status?: BuyerStatus;
  notes?: string;
}

export interface EnrichmentData {
  name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  sector_focus: string[];
  revenue_range: string | null;
  source: string;
}

export interface EnrichmentRequest {
  mode: 'text' | 'image';
  query?: string;
  imageBase64?: string;
}

export const BUYER_STATUS_OPTIONS: { value: BuyerStatus; label: string; color: string }[] = [
  { value: 'identificado', label: 'Identificado', color: 'bg-muted text-muted-foreground' },
  { value: 'contactado', label: 'Contactado', color: 'bg-blue-100 text-blue-700' },
  { value: 'interesado', label: 'Interesado', color: 'bg-green-100 text-green-700' },
  { value: 'negociando', label: 'Negociando', color: 'bg-amber-100 text-amber-700' },
  { value: 'descartado', label: 'Descartado', color: 'bg-red-100 text-red-700' },
];

export const REVENUE_RANGE_OPTIONS = [
  { value: '0-1M', label: '0 - 1M €' },
  { value: '1M-5M', label: '1M - 5M €' },
  { value: '5M-10M', label: '5M - 10M €' },
  { value: '10M-50M', label: '10M - 50M €' },
  { value: '50M+', label: '50M+ €' },
];
