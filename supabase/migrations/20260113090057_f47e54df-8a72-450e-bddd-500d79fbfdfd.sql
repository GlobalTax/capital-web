-- ============================================
-- MNA BOUTIQUES DIRECTORY - DATABASE SCHEMA
-- ============================================

-- 1. Main boutiques table
CREATE TABLE public.mna_boutiques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  linkedin_url TEXT,
  country_base TEXT DEFAULT 'Spain',
  cities TEXT[] DEFAULT '{}',
  founded_year INTEGER,
  employee_count INTEGER,
  employee_count_source TEXT,
  description TEXT,
  specialization TEXT[] DEFAULT '{}',
  sector_focus TEXT[] DEFAULT '{}',
  geography_focus TEXT[] DEFAULT '{}',
  deal_size_min NUMERIC,
  deal_size_max NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'acquired', 'closed')),
  tier TEXT CHECK (tier IN ('tier_1', 'tier_2', 'tier_3', 'regional', 'specialist')),
  notes_internal TEXT,
  source_url TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Boutique people table
CREATE TABLE public.mna_boutique_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID REFERENCES public.mna_boutiques(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('partner', 'managing_director', 'director', 'vp', 'associate', 'analyst', 'other')),
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  sector_expertise TEXT[] DEFAULT '{}',
  is_primary_contact BOOLEAN DEFAULT false,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Boutique deals/track record table
CREATE TABLE public.mna_boutique_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id UUID REFERENCES public.mna_boutiques(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  deal_type TEXT CHECK (deal_type IN ('sell_side', 'buy_side', 'capital_raise', 'due_diligence', 'valuation', 'restructuring', 'other')),
  deal_year INTEGER,
  deal_value NUMERIC,
  deal_value_currency TEXT DEFAULT 'EUR',
  sector TEXT,
  country TEXT,
  acquirer_name TEXT,
  role_in_deal TEXT CHECK (role_in_deal IN ('advisor_seller', 'advisor_buyer', 'lead_advisor', 'co_advisor', 'valuation', 'dd_provider')),
  description TEXT,
  source_url TEXT,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Indexes for performance
CREATE INDEX idx_mna_boutiques_name ON public.mna_boutiques(name);
CREATE INDEX idx_mna_boutiques_status ON public.mna_boutiques(status) WHERE is_deleted = false;
CREATE INDEX idx_mna_boutiques_country ON public.mna_boutiques(country_base) WHERE is_deleted = false;
CREATE INDEX idx_mna_boutiques_tier ON public.mna_boutiques(tier) WHERE is_deleted = false;
CREATE INDEX idx_mna_boutique_people_boutique ON public.mna_boutique_people(boutique_id) WHERE is_deleted = false;
CREATE INDEX idx_mna_boutique_deals_boutique ON public.mna_boutique_deals(boutique_id) WHERE is_deleted = false;
CREATE INDEX idx_mna_boutique_deals_year ON public.mna_boutique_deals(deal_year) WHERE is_deleted = false;

-- 5. Unique partial index to prevent duplicate boutiques by name
CREATE UNIQUE INDEX idx_mna_boutiques_unique_name ON public.mna_boutiques(LOWER(TRIM(name))) WHERE is_deleted = false;

-- 6. Triggers for updated_at
CREATE TRIGGER update_mna_boutiques_updated_at
  BEFORE UPDATE ON public.mna_boutiques
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mna_boutique_people_updated_at
  BEFORE UPDATE ON public.mna_boutique_people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mna_boutique_deals_updated_at
  BEFORE UPDATE ON public.mna_boutique_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Enable RLS
ALTER TABLE public.mna_boutiques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mna_boutique_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mna_boutique_deals ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies - Read access for authenticated admin users
CREATE POLICY "mna_boutiques_select_policy" ON public.mna_boutiques
  FOR SELECT TO authenticated
  USING (public.current_user_can_read());

CREATE POLICY "mna_boutiques_insert_policy" ON public.mna_boutiques
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write());

CREATE POLICY "mna_boutiques_update_policy" ON public.mna_boutiques
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write());

CREATE POLICY "mna_boutiques_delete_policy" ON public.mna_boutiques
  FOR DELETE TO authenticated
  USING (public.current_user_can_write());

-- People policies
CREATE POLICY "mna_boutique_people_select_policy" ON public.mna_boutique_people
  FOR SELECT TO authenticated
  USING (public.current_user_can_read());

CREATE POLICY "mna_boutique_people_insert_policy" ON public.mna_boutique_people
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write());

CREATE POLICY "mna_boutique_people_update_policy" ON public.mna_boutique_people
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write());

CREATE POLICY "mna_boutique_people_delete_policy" ON public.mna_boutique_people
  FOR DELETE TO authenticated
  USING (public.current_user_can_write());

-- Deals policies
CREATE POLICY "mna_boutique_deals_select_policy" ON public.mna_boutique_deals
  FOR SELECT TO authenticated
  USING (public.current_user_can_read());

CREATE POLICY "mna_boutique_deals_insert_policy" ON public.mna_boutique_deals
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_can_write());

CREATE POLICY "mna_boutique_deals_update_policy" ON public.mna_boutique_deals
  FOR UPDATE TO authenticated
  USING (public.current_user_can_write());

CREATE POLICY "mna_boutique_deals_delete_policy" ON public.mna_boutique_deals
  FOR DELETE TO authenticated
  USING (public.current_user_can_write());