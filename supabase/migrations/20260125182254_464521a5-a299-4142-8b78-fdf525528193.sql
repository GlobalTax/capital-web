-- =============================================
-- CORPORATE BUYERS MODULE - Independent Tables
-- =============================================

-- 1. Main table: corporate_buyers
CREATE TABLE public.corporate_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  country_base TEXT,
  cities TEXT[],
  
  -- Buyer type
  buyer_type TEXT CHECK (buyer_type IN ('corporate', 'family_office', 'pe_fund', 'strategic_buyer', 'holding')),
  
  -- Investment criteria
  description TEXT,
  investment_thesis TEXT,
  search_keywords TEXT[],
  sector_focus TEXT[],
  sector_exclusions TEXT[],
  geography_focus TEXT[],
  
  -- Financial ranges
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  deal_size_min NUMERIC,
  deal_size_max NUMERIC,
  
  -- Metadata
  source_url TEXT,
  notes_internal TEXT,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Contacts table: corporate_contacts
CREATE TABLE public.corporate_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.corporate_buyers(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('m_and_a', 'cxo', 'owner', 'business_dev', 'director', 'partner', 'other')),
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Favorites table: corporate_favorites (team-wide like other CRM modules)
CREATE TABLE public.corporate_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('buyer', 'contact')) NOT NULL,
  entity_id UUID NOT NULL,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

-- 4. Indexes for performance
CREATE INDEX idx_corporate_buyers_name ON public.corporate_buyers(name);
CREATE INDEX idx_corporate_buyers_type ON public.corporate_buyers(buyer_type);
CREATE INDEX idx_corporate_buyers_country ON public.corporate_buyers(country_base);
CREATE INDEX idx_corporate_buyers_active ON public.corporate_buyers(is_active) WHERE is_deleted = false;
CREATE INDEX idx_corporate_contacts_buyer ON public.corporate_contacts(buyer_id);
CREATE INDEX idx_corporate_contacts_email ON public.corporate_contacts(email);
CREATE INDEX idx_corporate_favorites_entity ON public.corporate_favorites(entity_type, entity_id);

-- 5. Enable RLS
ALTER TABLE public.corporate_buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corporate_favorites ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for corporate_buyers
CREATE POLICY "Authenticated users can view corporate buyers"
ON public.corporate_buyers FOR SELECT
TO authenticated
USING (is_deleted = false);

CREATE POLICY "Admins can insert corporate buyers"
ON public.corporate_buyers FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update corporate buyers"
ON public.corporate_buyers FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete corporate buyers"
ON public.corporate_buyers FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. RLS Policies for corporate_contacts
CREATE POLICY "Authenticated users can view corporate contacts"
ON public.corporate_contacts FOR SELECT
TO authenticated
USING (is_deleted = false);

CREATE POLICY "Admins can insert corporate contacts"
ON public.corporate_contacts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update corporate contacts"
ON public.corporate_contacts FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete corporate contacts"
ON public.corporate_contacts FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. RLS Policies for corporate_favorites (team-wide)
CREATE POLICY "Authenticated users can view corporate favorites"
ON public.corporate_favorites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert corporate favorites"
ON public.corporate_favorites FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete corporate favorites"
ON public.corporate_favorites FOR DELETE
TO authenticated
USING (true);

-- 9. Updated_at trigger
CREATE TRIGGER update_corporate_buyers_updated_at
  BEFORE UPDATE ON public.corporate_buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_corporate_contacts_updated_at
  BEFORE UPDATE ON public.corporate_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();