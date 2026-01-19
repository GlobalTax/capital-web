// ============================================
// PE/SEARCH FUND SECTOR TAXONOMY
// Standard sectors used in Private Equity and Search Funds
// ============================================

export interface PESector {
  id: string;
  nameEn: string;
  nameEs: string;
  keywords: string[];
}

export const PE_SECTORS: PESector[] = [
  { id: 'business_services', nameEn: 'Business Services', nameEs: 'Servicios Empresariales', keywords: ['consulting', 'outsourcing', 'BPO', 'professional services', 'staffing', 'HR', 'facility'] },
  { id: 'industrial_services', nameEn: 'Industrial Services', nameEs: 'Servicios Industriales', keywords: ['maintenance', 'repair', 'industrial', 'technical services', 'field services'] },
  { id: 'manufacturing', nameEn: 'Manufacturing', nameEs: 'Manufactura', keywords: ['production', 'factory', 'fabrication', 'assembly', 'industrial products'] },
  { id: 'construction_engineering', nameEn: 'Construction & Engineering', nameEs: 'Construcción e Ingeniería', keywords: ['construction', 'engineering', 'infrastructure', 'civil', 'building', 'architecture'] },
  { id: 'energy_utilities', nameEn: 'Energy & Utilities', nameEs: 'Energía y Utilities', keywords: ['energy', 'utilities', 'power', 'renewable', 'solar', 'wind', 'oil', 'gas'] },
  { id: 'technology_software', nameEn: 'Technology & Software', nameEs: 'Tecnología y Software', keywords: ['software', 'SaaS', 'IT', 'tech', 'digital', 'platform', 'analytics', 'cloud', 'AI'] },
  { id: 'healthcare', nameEn: 'Healthcare', nameEs: 'Salud', keywords: ['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinic', 'dental'] },
  { id: 'consumer_services', nameEn: 'Consumer Services', nameEs: 'Servicios al Consumidor', keywords: ['retail services', 'personal services', 'home services', 'B2C services'] },
  { id: 'consumer_products', nameEn: 'Consumer Products', nameEs: 'Productos de Consumo', keywords: ['consumer goods', 'retail products', 'FMCG', 'apparel', 'beauty'] },
  { id: 'distribution_logistics', nameEn: 'Distribution & Logistics', nameEs: 'Distribución y Logística', keywords: ['distribution', 'logistics', 'warehousing', 'supply chain', 'wholesale'] },
  { id: 'transportation', nameEn: 'Transportation', nameEs: 'Transporte', keywords: ['transport', 'shipping', 'freight', 'fleet', 'trucking', 'delivery'] },
  { id: 'education_training', nameEn: 'Education & Training', nameEs: 'Educación y Formación', keywords: ['education', 'training', 'learning', 'e-learning', 'academy', 'school'] },
  { id: 'financial_services', nameEn: 'Financial Services', nameEs: 'Servicios Financieros', keywords: ['finance', 'banking', 'insurance', 'fintech', 'payments', 'lending'] },
  { id: 'real_estate_services', nameEn: 'Real Estate Services', nameEs: 'Servicios Inmobiliarios', keywords: ['real estate', 'property', 'rental', 'brokerage', 'property management'] },
  { id: 'environmental_services', nameEn: 'Environmental Services', nameEs: 'Servicios Medioambientales', keywords: ['environmental', 'waste', 'recycling', 'sustainability', 'green'] },
  { id: 'media_marketing', nameEn: 'Media & Marketing', nameEs: 'Medios y Marketing', keywords: ['media', 'marketing', 'advertising', 'digital marketing', 'agency', 'PR'] },
  { id: 'agriculture_food', nameEn: 'Agriculture & Food', nameEs: 'Agricultura y Alimentación', keywords: ['agriculture', 'food', 'farming', 'agribusiness', 'F&B', 'beverage'] },
  { id: 'hospitality_leisure', nameEn: 'Hospitality & Leisure', nameEs: 'Hostelería y Ocio', keywords: ['hospitality', 'hotel', 'restaurant', 'leisure', 'entertainment', 'tourism'] },
  { id: 'other', nameEn: 'Other', nameEs: 'Otros', keywords: ['other', 'diversified', 'multi-sector'] },
] as const;

// Options for forms (Spanish labels)
export const PE_SECTOR_OPTIONS = PE_SECTORS.map(s => ({
  value: s.id,
  label: s.nameEs,
}));

// Options for forms (English labels)
export const PE_SECTOR_OPTIONS_EN = PE_SECTORS.map(s => ({
  value: s.id,
  label: s.nameEn,
}));

// Quick lookup by ID
export const PE_SECTOR_BY_ID: Record<string, PESector> = PE_SECTORS.reduce(
  (acc, sector) => ({ ...acc, [sector.id]: sector }),
  {}
);

// Related sectors for matching bonus
export const RELATED_SECTORS: Record<string, string[]> = {
  'technology_software': ['business_services', 'media_marketing'],
  'distribution_logistics': ['transportation', 'manufacturing'],
  'industrial_services': ['manufacturing', 'construction_engineering'],
  'healthcare': ['consumer_services', 'technology_software'],
  'business_services': ['technology_software', 'financial_services'],
  'construction_engineering': ['industrial_services', 'real_estate_services'],
  'energy_utilities': ['environmental_services', 'industrial_services'],
  'consumer_services': ['hospitality_leisure', 'consumer_products'],
  'consumer_products': ['distribution_logistics', 'manufacturing'],
  'transportation': ['distribution_logistics', 'industrial_services'],
  'education_training': ['technology_software', 'business_services'],
  'financial_services': ['business_services', 'technology_software'],
  'real_estate_services': ['construction_engineering', 'financial_services'],
  'environmental_services': ['energy_utilities', 'industrial_services'],
  'media_marketing': ['technology_software', 'business_services'],
  'agriculture_food': ['distribution_logistics', 'manufacturing'],
  'hospitality_leisure': ['consumer_services', 'real_estate_services'],
};

// Legacy sector mapping for migration
export const LEGACY_SECTOR_MAPPING: Record<string, string> = {
  // Spanish sectors from company_operations
  'SaaS': 'technology_software',
  'SaaS Vertical': 'technology_software',
  'Consultoría SAP': 'technology_software',
  'Consultoría TIC': 'technology_software',
  'Tecnología': 'technology_software',
  'Software': 'technology_software',
  'Construcción': 'construction_engineering',
  'Estructuras Metálicas': 'manufacturing',
  'Frío Industrial': 'industrial_services',
  'Distribución Alimentaria': 'distribution_logistics',
  'Distribución Industrial': 'distribution_logistics',
  'Distribución Sanitaria': 'distribution_logistics',
  'Energía y Renovables': 'energy_utilities',
  'Energías Renovables': 'energy_utilities',
  'Energía': 'energy_utilities',
  'Facility Services': 'business_services',
  'Gestión de Residuos': 'environmental_services',
  'Logística y Transporte': 'transportation',
  'Logística': 'distribution_logistics',
  'Transporte': 'transportation',
  'Restauración': 'hospitality_leisure',
  'Hostelería': 'hospitality_leisure',
  'Salud y Biotecnología': 'healthcare',
  'Salud': 'healthcare',
  'Healthcare': 'healthcare',
  'Consultoría': 'business_services',
  'Servicios Profesionales': 'business_services',
  'Retail': 'consumer_products',
  'Alimentación': 'agriculture_food',
  'Agricultura': 'agriculture_food',
  'Educación': 'education_training',
  'Formación': 'education_training',
  'Marketing': 'media_marketing',
  'Publicidad': 'media_marketing',
  'Inmobiliario': 'real_estate_services',
  'Finanzas': 'financial_services',
  'Seguros': 'financial_services',
  'Manufactura': 'manufacturing',
  'Industrial': 'industrial_services',
  // English sectors
  'Technology': 'technology_software',
  'Software & Technology': 'technology_software',
  'Tech': 'technology_software',
  'Construction': 'construction_engineering',
  'Engineering': 'construction_engineering',
  'Energy': 'energy_utilities',
  'Utilities': 'energy_utilities',
  'Healthcare & Life Sciences': 'healthcare',
  'Consumer': 'consumer_products',
  'Retail & Consumer': 'consumer_products',
  'Logistics': 'distribution_logistics',
  'Transport': 'transportation',
  'Education': 'education_training',
  'Financial': 'financial_services',
  'Real Estate': 'real_estate_services',
  'Environment': 'environmental_services',
  'Media': 'media_marketing',
  'Food & Beverage': 'agriculture_food',
  'Hospitality': 'hospitality_leisure',
};

// Get PE sector from legacy sector
export function mapLegacySectorToPE(legacySector: string | null | undefined): string | null {
  if (!legacySector) return null;
  
  // Direct match
  if (LEGACY_SECTOR_MAPPING[legacySector]) {
    return LEGACY_SECTOR_MAPPING[legacySector];
  }
  
  // Partial match (case insensitive)
  const lowerSector = legacySector.toLowerCase();
  for (const [legacy, pe] of Object.entries(LEGACY_SECTOR_MAPPING)) {
    if (lowerSector.includes(legacy.toLowerCase()) || legacy.toLowerCase().includes(lowerSector)) {
      return pe;
    }
  }
  
  return null;
}

// Check if two sectors are related (for matching bonus)
export function areSectorsRelated(sector1: string, sector2: string): boolean {
  if (sector1 === sector2) return true;
  return RELATED_SECTORS[sector1]?.includes(sector2) || RELATED_SECTORS[sector2]?.includes(sector1);
}
