export interface Sector {
  id: string;
  name_es: string;
  name_en?: string;
  name?: string; // Resolved name based on current locale (computed in useSectors)
  slug: string;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateSectorRequest {
  name_es: string;
  name_en?: string;
  slug: string;
  parent_id?: string;
  description?: string;
  display_order?: number;
}

export interface UpdateSectorRequest extends Partial<CreateSectorRequest> {
  is_active?: boolean;
  usage_count?: number;
}

export interface SectorWithChildren extends Sector {
  children?: SectorWithChildren[];
}