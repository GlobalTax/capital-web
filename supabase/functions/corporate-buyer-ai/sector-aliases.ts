// =============================================
// SECTOR ALIASES - Normalization for better matching
// =============================================

// Standard PE/SF sectors with their aliases and variations
export const SECTOR_ALIASES: Record<string, string[]> = {
  'tecnologia': ['tecnología', 'tech', 'software', 'it', 'tic', 'digital', 'saas', 'technology', 'informática', 'informatica', 'sistemas', 'cloud', 'plataformas', 'apps'],
  'hosteleria': ['hostelería', 'turismo', 'hoteles', 'restaurantes', 'bares', 'turismo y hostelería', 'hospitality', 'horeca', 'ocio', 'leisure', 'viajes', 'travel'],
  'alimentacion': ['alimentación', 'bebidas', 'food', 'f&b', 'alimentación y bebidas', 'alimentos', 'food & beverage', 'agroalimentario', 'fmcg', 'consumo masivo'],
  'construccion': ['construcción', 'inmobiliario', 'real estate', 'promotora', 'construcción', 'infraestructuras', 'building', 'obras', 'ingeniería civil'],
  'industria': ['industrial', 'manufacturero', 'manufactura', 'industrial y manufacturero', 'manufacturing', 'producción', 'fabricación', 'metal', 'metalúrgico', 'maquinaria'],
  'servicios': ['servicios', 'consulting', 'consultoría', 'asesoría', 'services', 'b2b services', 'servicios profesionales', 'outsourcing', 'bpo'],
  'salud': ['salud', 'healthcare', 'sanitario', 'biotecnología', 'pharma', 'health', 'hospitalario', 'clínicas', 'médico', 'farmacéutico', 'biotech', 'life sciences', 'salud y biotecnología'],
  'logistica': ['logística', 'transporte', 'distribución', 'supply chain', 'logistics', 'almacenaje', 'warehousing', 'freight', 'courier', 'última milla', 'logística y transporte'],
  'energia': ['energía', 'renovables', 'utilities', 'oil & gas', 'energy', 'solar', 'eólico', 'eólica', 'fotovoltaico', 'sostenibilidad', 'energía y renovables', 'cleantech'],
  'retail': ['retail', 'consumo', 'comercio', 'tiendas', 'e-commerce', 'ecommerce', 'minorista', 'retail y consumo', 'gran distribución', 'distribution'],
  'financiero': ['financiero', 'finance', 'banca', 'seguros', 'insurance', 'fintech', 'servicios financieros', 'banking', 'inversión', 'gestión de activos', 'asset management'],
  'telecomunicaciones': ['telecomunicaciones', 'telecom', 'telco', 'comunicaciones', 'fibra', 'redes', 'móvil', 'mobile'],
  'medios': ['medios', 'entretenimiento', 'media', 'entertainment', 'publicidad', 'advertising', 'marketing', 'contenidos', 'audiovisual', 'medios y entretenimiento', 'gaming'],
  'educacion': ['educación', 'education', 'formación', 'training', 'e-learning', 'edtech', 'academias', 'colegios', 'universidades'],
  'quimico': ['químico', 'chemical', 'petroquímico', 'plásticos', 'materiales', 'polímeros', 'specialty chemicals'],
  'textil': ['textil', 'moda', 'fashion', 'apparel', 'confección', 'calzado', 'footwear', 'textil y moda', 'lujo', 'luxury'],
  'agricultura': ['agricultura', 'agro', 'agrícola', 'agribusiness', 'ganadería', 'farming', 'semillas', 'fertilizantes', 'maquinaria agrícola'],
  'seguridad': ['seguridad', 'security', 'vigilancia', 'ciberseguridad', 'cybersecurity', 'protección', 'defensa'],
  'inmobiliario': ['inmobiliario', 'real estate', 'proptech', 'promotoras', 'gestión inmobiliaria', 'property', 'alquiler', 'vivienda'],
  'automocion': ['automoción', 'automotive', 'automóvil', 'vehículos', 'recambios', 'aftermarket', 'movilidad', 'mobility', 'automoción']
};

// Geography aliases for normalization
export const GEOGRAPHY_ALIASES: Record<string, string[]> = {
  'españa': ['españa', 'spain', 'es', 'spanish', 'iberia', 'ibérico'],
  'madrid': ['madrid', 'comunidad de madrid', 'mad'],
  'cataluña': ['cataluña', 'catalunya', 'barcelona', 'cat', 'bcn'],
  'valencia': ['valencia', 'comunidad valenciana', 'valenciana', 'vlc'],
  'andalucia': ['andalucía', 'andalucia', 'sevilla', 'málaga', 'malaga'],
  'pais vasco': ['país vasco', 'pais vasco', 'euskadi', 'bilbao', 'vizcaya'],
  'galicia': ['galicia', 'coruña', 'vigo', 'pontevedra'],
  'portugal': ['portugal', 'pt', 'portuguese', 'lisboa', 'porto'],
  'europa': ['europa', 'europe', 'eu', 'european', 'eurozona'],
  'latam': ['latam', 'latinoamérica', 'latinoamerica', 'américa latina', 'sudamérica', 'centroamérica'],
  'mexico': ['méxico', 'mexico', 'mx', 'mexican'],
  'usa': ['usa', 'estados unidos', 'eeuu', 'us', 'american', 'norteamérica'],
  'uk': ['uk', 'reino unido', 'united kingdom', 'britain', 'british', 'england', 'london'],
  'francia': ['francia', 'france', 'fr', 'french', 'paris'],
  'alemania': ['alemania', 'germany', 'de', 'german', 'deutschland'],
  'italia': ['italia', 'italy', 'it', 'italian', 'milano', 'roma']
};

/**
 * Normalize a sector string to its canonical form and return all aliases
 */
export function normalizeSector(sector: string): string[] {
  const lower = sector.toLowerCase().trim();
  
  // Search in aliases
  for (const [normalized, aliases] of Object.entries(SECTOR_ALIASES)) {
    if (aliases.some(a => lower.includes(a) || a.includes(lower))) {
      return [normalized, ...aliases];
    }
  }
  
  // Return original if no match found
  return [lower];
}

/**
 * Check if buyer sectors match a target sector using aliases
 */
export function sectorsMatch(buyerSectors: string[], targetSector: string | null): boolean {
  if (!targetSector || buyerSectors.length === 0) return false;
  
  const targetNormalized = normalizeSector(targetSector);
  
  return buyerSectors.some(bs => {
    const buyerNormalized = normalizeSector(bs);
    return buyerNormalized.some(b => 
      targetNormalized.some(t => 
        b === t || 
        b.includes(t) || 
        t.includes(b)
      )
    );
  });
}

/**
 * Normalize geography string
 */
export function normalizeGeography(geo: string): string[] {
  const lower = geo.toLowerCase().trim();
  
  for (const [normalized, aliases] of Object.entries(GEOGRAPHY_ALIASES)) {
    if (aliases.some(a => lower.includes(a) || a.includes(lower))) {
      return [normalized, ...aliases];
    }
  }
  
  return [lower];
}

/**
 * Check if buyer geography matches a target location
 */
export function geographyMatches(buyerGeos: string[], targetLocation: string | null): boolean {
  if (!targetLocation || buyerGeos.length === 0) return false;
  
  const targetNormalized = normalizeGeography(targetLocation);
  
  return buyerGeos.some(bg => {
    const buyerNormalized = normalizeGeography(bg);
    return buyerNormalized.some(b => 
      targetNormalized.some(t => 
        b === t || 
        b.includes(t) || 
        t.includes(b)
      )
    );
  });
}

/**
 * Extract meaningful keywords from text
 */
export function extractKeywords(text: string): string[] {
  const stopwords = [
    'para', 'como', 'este', 'esta', 'tiene', 'desde', 'hasta', 'sobre',
    'todos', 'cada', 'muy', 'más', 'menos', 'entre', 'hacia', 'donde',
    'cuando', 'quien', 'cual', 'the', 'and', 'for', 'with', 'that', 'this',
    'are', 'was', 'been', 'have', 'has', 'will', 'would', 'could', 'should'
  ];
  
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 4 && !stopwords.includes(w))
    .slice(0, 15);
}

/**
 * Calculate semantic score based on keywords matching
 */
export function calculateSemanticScore(
  buyerKeywords: string[] | null,
  buyerThesis: string | null,
  targetDescription: string | null
): { score: number; matchedTerms: string[] } {
  if (!targetDescription) {
    return { score: 0, matchedTerms: [] };
  }
  
  const descLower = targetDescription.toLowerCase();
  const matchedTerms: string[] = [];
  let score = 0;
  
  // Match by buyer keywords
  if (buyerKeywords && buyerKeywords.length > 0) {
    const keywordMatches = buyerKeywords.filter(kw => 
      descLower.includes(kw.toLowerCase())
    );
    score += Math.min(keywordMatches.length * 8, 30);
    matchedTerms.push(...keywordMatches);
  }
  
  // Match by thesis keywords
  if (buyerThesis) {
    const thesisKeywords = extractKeywords(buyerThesis);
    const thesisMatches = thesisKeywords.filter(k => 
      descLower.includes(k.toLowerCase())
    );
    score += Math.min(thesisMatches.length * 4, 20);
    matchedTerms.push(...thesisMatches.filter(m => !matchedTerms.includes(m)));
  }
  
  return { 
    score: Math.min(score, 50), // Cap at 50 extra points
    matchedTerms: [...new Set(matchedTerms)].slice(0, 5) // Unique terms, max 5
  };
}

/**
 * Expand buyer sectors to include all aliases for database filtering
 */
export function expandSectorsForQuery(sectors: string[]): string[] {
  const expanded = new Set<string>();
  
  for (const sector of sectors) {
    const normalized = normalizeSector(sector);
    normalized.forEach(s => expanded.add(s));
  }
  
  return [...expanded];
}
