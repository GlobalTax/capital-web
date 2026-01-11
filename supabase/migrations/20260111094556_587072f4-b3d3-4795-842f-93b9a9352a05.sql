-- ============================================
-- SEARCH FUNDS AI INFRASTRUCTURE
-- ============================================

-- 1. Extend sf_funds with new fields for AI extraction
ALTER TABLE sf_funds 
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('traditional_search_fund', 'self_funded_search', 'operator_led', 'holding_company', 'unknown')),
ADD COLUMN IF NOT EXISTS transaction_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS size_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS data_quality JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scrape_source_urls TEXT[] DEFAULT '{}';

-- 2. Create table for search queries (Prompt #1 output)
CREATE TABLE IF NOT EXISTS sf_search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  country_code TEXT NOT NULL,
  query TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('discover', 'criteria', 'contact', 'activity')),
  priority INT CHECK (priority BETWEEN 1 AND 5) DEFAULT 3,
  last_executed_at TIMESTAMPTZ,
  results_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create table for scraped URLs (deduplication and relevance filtering)
CREATE TABLE IF NOT EXISTS sf_scraped_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  url_hash TEXT UNIQUE NOT NULL,
  domain TEXT,
  is_relevant BOOLEAN,
  entity_type TEXT,
  stage TEXT,
  confidence INT CHECK (confidence BETWEEN 0 AND 100),
  fund_id UUID REFERENCES sf_funds(id) ON DELETE SET NULL,
  query_id UUID REFERENCES sf_search_queries(id) ON DELETE SET NULL,
  raw_title TEXT,
  raw_snippet TEXT,
  raw_content TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  extraction_error TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  extracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create table for AI prompts (configurable prompt templates)
CREATE TABLE IF NOT EXISTS sf_ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('discovery', 'extraction', 'enrichment', 'matching', 'outreach', 'monitoring')),
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  output_schema JSONB,
  variables TEXT[] DEFAULT '{}',
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature NUMERIC DEFAULT 0.3,
  max_tokens INT DEFAULT 2000,
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create table for AI execution logs
CREATE TABLE IF NOT EXISTS sf_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  tokens_used INT,
  duration_ms INT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sf_search_queries_country ON sf_search_queries(country_code);
CREATE INDEX IF NOT EXISTS idx_sf_search_queries_active ON sf_search_queries(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sf_scraped_urls_domain ON sf_scraped_urls(domain);
CREATE INDEX IF NOT EXISTS idx_sf_scraped_urls_relevant ON sf_scraped_urls(is_relevant) WHERE is_relevant = true;
CREATE INDEX IF NOT EXISTS idx_sf_scraped_urls_status ON sf_scraped_urls(extraction_status);
CREATE INDEX IF NOT EXISTS idx_sf_ai_prompts_key ON sf_ai_prompts(key);
CREATE INDEX IF NOT EXISTS idx_sf_ai_logs_prompt ON sf_ai_logs(prompt_key);

-- 7. Enable RLS
ALTER TABLE sf_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_scraped_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf_ai_logs ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for admin access
CREATE POLICY "Admin full access to sf_search_queries" ON sf_search_queries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to sf_scraped_urls" ON sf_scraped_urls
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to sf_ai_prompts" ON sf_ai_prompts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to sf_ai_logs" ON sf_ai_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- 9. Seed initial search queries for European countries
INSERT INTO sf_search_queries (country, country_code, query, intent, priority) VALUES
-- Spain
('España', 'ES', 'search fund España adquirir empresa', 'discover', 5),
('España', 'ES', 'fondo de búsqueda criterios inversión PYME', 'criteria', 4),
('España', 'ES', 'entrepreneurship through acquisition Spain', 'discover', 4),
('España', 'ES', 'ETA investor Spain acquiring SME', 'discover', 3),
('España', 'ES', 'search fund looking to acquire Spain', 'discover', 5),
('España', 'ES', 'searcher IESE ESADE adquisición', 'discover', 3),
-- France
('France', 'FR', 'search fund France acquisition PME', 'discover', 5),
('France', 'FR', 'fonds de recherche entrepreneur acquisition', 'discover', 4),
('France', 'FR', 'ETA France critères investissement', 'criteria', 4),
('France', 'FR', 'reprise entreprise search fund HEC INSEAD', 'discover', 3),
-- Germany
('Deutschland', 'DE', 'search fund Deutschland Unternehmensnachfolge', 'discover', 5),
('Deutschland', 'DE', 'entrepreneurship through acquisition Germany', 'discover', 4),
('Deutschland', 'DE', 'search fund DACH region acquiring SME', 'criteria', 4),
('Deutschland', 'DE', 'Nachfolger sucht Unternehmen Mittelstand', 'discover', 3),
-- Italy
('Italia', 'IT', 'search fund Italia acquisizione PMI', 'discover', 5),
('Italia', 'IT', 'fondo di ricerca imprenditore acquisizione', 'discover', 4),
('Italia', 'IT', 'ETA Italy investment criteria', 'criteria', 3),
-- UK
('United Kingdom', 'GB', 'search fund UK acquisition criteria', 'discover', 5),
('United Kingdom', 'GB', 'ETA entrepreneur looking to acquire UK SME', 'discover', 4),
('United Kingdom', 'GB', 'self-funded search UK business acquisition', 'discover', 4),
('United Kingdom', 'GB', 'search fund London Oxford Cambridge', 'discover', 3),
-- Benelux
('Netherlands', 'NL', 'search fund Netherlands acquiring company', 'discover', 4),
('Belgium', 'BE', 'search fund Belgium acquisition PME', 'discover', 4),
('Luxembourg', 'LU', 'search fund Luxembourg private equity', 'discover', 3),
-- Portugal
('Portugal', 'PT', 'search fund Portugal aquisição empresa', 'discover', 4),
('Portugal', 'PT', 'fundo de busca empreendedor PME', 'discover', 3),
-- Switzerland/Austria
('Schweiz', 'CH', 'search fund Switzerland Nachfolge KMU', 'discover', 4),
('Österreich', 'AT', 'search fund Austria Unternehmensnachfolge', 'discover', 3)
ON CONFLICT DO NOTHING;

-- 10. Seed the 10 AI prompts
INSERT INTO sf_ai_prompts (key, name, description, category, system_prompt, user_prompt_template, variables, model, temperature, max_tokens) VALUES
-- Prompt #1: Generate Queries
('generate-queries', 'Query Generator', 'Genera queries de búsqueda para descubrir searchers por país', 'discovery',
'Eres un analista de M&A sell-side especializado en Search Funds/ETA en Europa.
Objetivo: generar consultas de búsqueda (queries) para descubrir searchers/search funds activos que buscan adquirir PYMEs.

Contexto:
- Queremos encontrar: "search fund", "fondo de búsqueda", "entrepreneurship through acquisition", "ETA", "holding company acquisition entrepreneur", "operator-led buyout", "acquisition entrepreneur".
- Evitar ruido de: fondos de inversión genéricos, artículos académicos sin nombres, noticias sin webs de compradores.

Instrucciones:
1) Devuelve entre 20 y 35 queries.
2) Mezcla queries en el idioma local + inglés.
3) Incluye queries orientadas a "contacto / criterios / acquiring".
4) Incluye 5 queries "long-tail" (más específicas) y 5 queries "broad".
5) No inventes nombres propios. No incluyas URLs.',
'País objetivo: {{country}} (código ISO: {{country_code}})

Devuelve JSON con este esquema:
{
  "country": "...",
  "country_code": "...",
  "queries": [
    {"query": "...", "intent": "discover|criteria|contact|activity", "priority": 1-5}
  ]
}',
ARRAY['country', 'country_code'], 'gpt-4o-mini', 0.5, 2000),

-- Prompt #2: Relevance Filter
('relevance-filter', 'Relevance Filter', 'Determina si una URL es relevante como buyer tipo Search Fund', 'discovery',
'Actúa como clasificador de leads para una base de datos de compradores tipo Search Fund/ETA en Europa.

Tarea:
1) Determina si esta página describe (a) un search fund/searcher activo, (b) un programa/operator-led/holding de ETA, o (c) no es relevante.
2) Si NO es relevante, explica por qué (en 1-2 frases).
3) Si SÍ es relevante, clasifica el tipo y la etapa si hay señales.

Reglas:
- No adivines. Si no hay evidencia, usa "unknown".
- No confundas "search fund report/centro académico" con un buyer.
- Considera relevante si hay señales como: "looking to acquire", "acquisition criteria", "investment criteria", "searching for a company", "fondo de búsqueda para adquirir".',
'URL: {{url}}
Título: {{title}}
Snippet: {{snippet}}
Contenido (markdown): {{page_markdown}}

Devuelve JSON:
{
  "is_relevant": true|false,
  "entity_type": "traditional_search_fund|self_funded_search|operator_led|holding_company|community_or_report|pe_fund|other|unknown",
  "stage": "fundraising|searching|under_offer|acquired|inactive|unknown",
  "confidence": 0-100,
  "reason": "..."
}',
ARRAY['url', 'title', 'snippet', 'page_markdown'], 'gpt-4o-mini', 0.2, 500),

-- Prompt #3: Extract Profile (CRITICAL)
('extract-profile', 'Profile Extractor', 'Extrae perfil estructurado de buyer desde contenido web', 'extraction',
'Eres un extractor de datos para un CRM de compradores (Search Funds / Searchers / ETA) en España y Europa.
Vas a recibir contenido web (markdown) y debes extraer un perfil estructurado.

Instrucciones críticas:
- NO inventes datos.
- Si un campo no aparece, devuelve null o [].
- Si hay ambigüedad, usa "unknown".
- Para cualquier dato clave (geo, tamaño, etapa, contacto), incluye evidencia con una cita corta (máx 20 palabras) y la URL.
- Normaliza moneda: si se menciona € o EUR, deja EUR; si no hay moneda, deja "unknown".
- Normaliza geografía a países/ciudades cuando sea posible.
- Idiomas: el contenido puede estar en español/inglés/francés/alemán/italiano/portugués; extrae igual.',
'URL: {{url}}
Contenido (markdown): {{page_markdown}}

Devuelve JSON EXACTAMENTE con este esquema:
{
  "name": string|null,
  "entity_type": "traditional_search_fund|self_funded_search|operator_led|holding_company|unknown",
  "website": string|null,
  "based_in": {"country": string|null, "city": string|null},
  "geo_focus": [string],
  "industry_focus": [string],
  "stage": "fundraising|searching|under_offer|acquired|inactive|unknown",
  "transaction_preferences": {
    "majority": boolean|null,
    "full_buyout": boolean|null,
    "minority": boolean|null,
    "succession": boolean|null,
    "carve_out": boolean|null
  },
  "size_criteria": {
    "metric": "EV|EBITDA|Revenue|Employees|unknown",
    "min": number|null,
    "max": number|null,
    "currency": "EUR|GBP|USD|unknown",
    "notes": string|null
  },
  "keywords": [string],
  "team": [
    {"name": string, "role": string|null, "linkedin": string|null}
  ],
  "backers_or_affiliations": [
    {"name": string, "type": "investor|school|accelerator|partner|unknown"}
  ],
  "contact": {
    "emails": [string],
    "contact_forms": [string],
    "linkedin": string|null
  },
  "evidence": [
    {"field": string, "quote": string, "url": string}
  ],
  "data_quality": {
    "is_homepage_only": boolean,
    "missing_critical_fields": [string],
    "notes": string|null
  }
}',
ARRAY['url', 'page_markdown'], 'gpt-4o', 0.2, 3000),

-- Prompt #4: Enrich Profile
('enrich-profile', 'Profile Enricher', 'Fusiona datos de múltiples páginas sin duplicar', 'enrichment',
'Eres un "merger" de perfiles para un CRM de buyers.

Tarea:
1) Actualiza el perfil con cualquier dato NUEVO.
2) No sobreescribas datos existentes si la nueva evidencia es más débil o ambigua.
3) Si hay conflicto, conserva ambos en "data_quality.notes" y baja confianza (no inventes).
4) Añade evidencia para cada campo actualizado.',
'Perfil actual (JSON): {{buyer_profile_json}}

Nueva evidencia:
- URL: {{url}}
- Contenido (markdown): {{page_markdown}}

Devuelve JSON con el MISMO esquema del perfil de buyer.',
ARRAY['buyer_profile_json', 'url', 'page_markdown'], 'gpt-4o-mini', 0.2, 3000),

-- Prompt #5: Dedupe Check
('dedupe-check', 'Deduplication Checker', 'Detecta si dos buyers son la misma entidad', 'enrichment',
'Eres un motor de resolución de entidades (dedupe).

Tarea:
1) Decide si son la misma entidad (true/false).
2) Explica la señal principal (dominio, nombre, contacto, equipo).
3) Si son la misma, sugiere "canonical_name" y qué campos mergear.',
'Buyer A (JSON): {{buyer_a_json}}
Buyer B (JSON): {{buyer_b_json}}

Devuelve JSON:
{
  "same_entity": true|false,
  "confidence": 0-100,
  "canonical_name": string|null,
  "merge_recommendation": {
    "keep_from_a": [string],
    "keep_from_b": [string],
    "merge_lists": [string]
  },
  "reason": string
}',
ARRAY['buyer_a_json', 'buyer_b_json'], 'gpt-4o-mini', 0.2, 1000),

-- Prompt #6: Generate Teaser
('generate-teaser', 'Anonymous Teaser Generator', 'Crea teaser anónimo de empresa para enviar a searchers', 'outreach',
'Eres un analista sell-side. Debes crear un teaser anónimo (sin nombre de empresa, sin clientes identificables, sin dirección exacta).
Tu objetivo es que un searcher entienda el fit y pida más info (NDA / call).

Instrucciones:
- Mantén confidencialidad: NO incluyas nombre, dominio, marcas, clientes, ni detalles que permitan identificar.
- Incluye métricas en rangos si es sensible.
- Enfatiza razones típicas de fit Search Fund: sucesión, estabilidad, crecimiento, equipo, barreras de entrada.
- 1 página textual (máx 250-350 palabras) + bullets.',
'Deal (JSON o texto): {{deal_profile_json}}

Devuelve JSON:
{
  "headline": string,
  "overview": string,
  "investment_highlights": [string],
  "key_metrics": {
    "revenue": string|null,
    "ebitda": string|null,
    "margin": string|null,
    "employees": string|null,
    "location_region": string|null
  },
  "what_is_sold": string,
  "reason_for_sale": string|null,
  "next_step_call_to_action": string
}',
ARRAY['deal_profile_json'], 'gpt-4o', 0.4, 1500),

-- Prompt #7: AI Matching (CRITICAL)
('ai-matching', 'AI Matching & Scoring', 'Calcula fit score entre empresa y buyer con razones detalladas', 'matching',
'Eres un motor de matching entre una empresa en venta y buyers tipo Search Fund/ETA.

Tarea:
1) Calcula un "fit_score" 0-100 basado en:
   - Geografía (40%)
   - Tamaño/criterios (30%)
   - Preferencias de transacción (20%)
   - Etapa/actividad (10%)
2) Devuelve:
   - razones concretas (máx 6 bullets),
   - riesgos o dudas (máx 4),
   - qué parte del teaser enfatizar,
   - preguntas de calificación para el buyer (máx 6).
3) No inventes: si falta criterio, penaliza ligeramente y marca "unknown".',
'Deal (JSON): {{deal_profile_json}}
Buyer (JSON): {{buyer_profile_json}}

Devuelve JSON:
{
  "fit_score": number,
  "fit_tier": "A|B|C|D",
  "reasons": [string],
  "risks_or_unknowns": [string],
  "recommended_angle": [string],
  "qualifying_questions": [string]
}',
ARRAY['deal_profile_json', 'buyer_profile_json'], 'gpt-4o', 0.3, 1500),

-- Prompt #8: Generate Outreach
('generate-outreach', 'Outreach Email Generator', 'Genera email de primer contacto personalizado', 'outreach',
'Eres un banquero M&A sell-side. Redacta un email de primer contacto para un searcher/buyer, ofreciendo una oportunidad confidencial.

Reglas:
- 110-170 palabras.
- 2 asuntos alternativos (subject lines).
- NO revelar nombre de empresa ni detalles identificables.
- Propón: NDA + call de 15 minutos.
- Menciona por qué encaja con su criterio (geo/tamaño/tipo), si existe evidencia.
- Tono profesional europeo, directo, sin marketing.',
'Tu identidad:
- Nombre: {{my_name}}
- Firma: {{my_firm}}
- Email: {{my_email}}
- Teléfono: {{my_phone}}

Buyer profile (JSON): {{buyer_profile_json}}
Teaser anónimo (JSON): {{teaser_json}}

Devuelve JSON:
{
  "subject_options": [string, string],
  "email_body": string
}',
ARRAY['my_name', 'my_firm', 'my_email', 'my_phone', 'buyer_profile_json', 'teaser_json'], 'gpt-4o', 0.5, 800),

-- Prompt #9: Generate Follow-up
('generate-followup', 'Follow-up Email Generator', 'Genera email de seguimiento si no responden', 'outreach',
'Redacta un follow-up breve y educado para el mismo buyer.

Reglas:
- 60-110 palabras.
- Incluye 1 pregunta fácil de contestar (sí/no o "quién en tu equipo").
- Reitera NDA + call corta.',
'Email anterior: {{previous_email_body}}
Buyer profile (JSON): {{buyer_profile_json}}
Teaser anónimo (JSON): {{teaser_json}}

Devuelve JSON:
{
  "followup_subject": string,
  "followup_body": string
}',
ARRAY['previous_email_body', 'buyer_profile_json', 'teaser_json'], 'gpt-4o-mini', 0.5, 500),

-- Prompt #10: Monitor Changes
('monitor-changes', 'Change Monitor', 'Detecta cambios materiales en perfil de buyer', 'monitoring',
'Eres un analista de cambios (diff) para perfiles de buyers.

Tarea:
1) Detecta cambios materiales: stage, geo_focus, size_criteria, contacto, equipo.
2) Resume en bullets accionables (máx 8).
3) Señala si el buyer debe pasar a "inactive" o "acquired".',
'Perfil anterior (JSON): {{old_buyer_profile_json}}
Perfil nuevo (JSON): {{new_buyer_profile_json}}

Devuelve JSON:
{
  "material_changes": [string],
  "recommended_actions": [string],
  "stage_change": {"from": string, "to": string, "is_material": boolean}
}',
ARRAY['old_buyer_profile_json', 'new_buyer_profile_json'], 'gpt-4o-mini', 0.2, 800)

ON CONFLICT (key) DO UPDATE SET
  system_prompt = EXCLUDED.system_prompt,
  user_prompt_template = EXCLUDED.user_prompt_template,
  variables = EXCLUDED.variables,
  updated_at = NOW();