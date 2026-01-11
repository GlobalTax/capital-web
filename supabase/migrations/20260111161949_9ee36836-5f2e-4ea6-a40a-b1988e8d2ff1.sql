
-- =====================================================
-- MÓDULO CAPITAL RIESGO (PE/VC) - MIGRACIÓN COMPLETA
-- =====================================================

-- 1. Tabla principal: cr_funds
CREATE TABLE public.cr_funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fund_type TEXT CHECK (fund_type IN ('private_equity', 'venture_capital', 'growth_equity', 'family_office', 'corporate', 'fund_of_funds')),
  website TEXT,
  country_base TEXT,
  cities TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'raising', 'deployed', 'closed', 'inactive')),
  founded_year INTEGER,
  aum NUMERIC,
  current_fund_number INTEGER,
  current_fund_size NUMERIC,
  description TEXT,
  investment_stage TEXT[],
  geography_focus TEXT[],
  sector_focus TEXT[],
  sector_exclusions TEXT[],
  ticket_min NUMERIC,
  ticket_max NUMERIC,
  ebitda_min NUMERIC,
  ebitda_max NUMERIC,
  revenue_min NUMERIC,
  revenue_max NUMERIC,
  deal_types TEXT[],
  notes_internal TEXT,
  source_url TEXT,
  source_last_verified_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla: cr_people
CREATE TABLE public.cr_people (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('partner', 'managing_partner', 'principal', 'director', 'associate', 'analyst', 'operating_partner', 'advisor', 'other')),
  title TEXT,
  email TEXT,
  linkedin_url TEXT,
  phone TEXT,
  location TEXT,
  sector_expertise TEXT[],
  is_primary_contact BOOLEAN DEFAULT false,
  is_email_verified BOOLEAN DEFAULT false,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla: cr_portfolio (Participadas)
CREATE TABLE public.cr_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website TEXT,
  country TEXT,
  sector TEXT,
  investment_year INTEGER,
  investment_type TEXT CHECK (investment_type IN ('lead', 'co_invest', 'follow_on')),
  ownership_type TEXT CHECK (ownership_type IN ('majority', 'minority', 'growth', 'control')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'exited', 'write_off', 'partial_exit')),
  exit_year INTEGER,
  exit_type TEXT CHECK (exit_type IN ('trade_sale', 'ipo', 'secondary', 'recap', 'write_off', 'merger', 'spac')),
  description TEXT,
  source_url TEXT,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla: cr_lps (Limited Partners)
CREATE TABLE public.cr_lps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('pension_fund', 'sovereign_wealth', 'endowment', 'family_office', 'fund_of_funds', 'insurance', 'bank', 'corporate', 'other')),
  country TEXT,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  aum NUMERIC,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla: cr_fund_lps (Relación Fund-LP)
CREATE TABLE public.cr_fund_lps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  lp_id UUID NOT NULL REFERENCES public.cr_lps(id) ON DELETE CASCADE,
  commitment_size NUMERIC,
  since_year INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fund_id, lp_id)
);

-- 6. Tabla: cr_deals (Transacciones/Historial)
CREATE TABLE public.cr_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES public.cr_portfolio(id) ON DELETE SET NULL,
  deal_type TEXT CHECK (deal_type IN ('acquisition', 'add_on', 'exit', 'recap', 'follow_on', 'ipo', 'merger')),
  company_name TEXT NOT NULL,
  deal_year INTEGER,
  deal_value NUMERIC,
  sector TEXT,
  country TEXT,
  description TEXT,
  source_url TEXT,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabla: cr_matches (Matching con operaciones)
CREATE TABLE public.cr_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  crm_entity_type TEXT NOT NULL CHECK (crm_entity_type IN ('operation', 'mandato', 'empresa')),
  crm_entity_id UUID NOT NULL,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_reasons JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'interested', 'not_fit', 'won', 'lost')),
  owner_user_id UUID,
  notes TEXT,
  last_scored_at TIMESTAMPTZ,
  contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fund_id, crm_entity_type, crm_entity_id)
);

-- 8. Tabla: cr_fund_audit_log (Auditoría)
CREATE TABLE public.cr_fund_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fund_id UUID NOT NULL REFERENCES public.cr_funds(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX idx_cr_funds_status ON public.cr_funds(status);
CREATE INDEX idx_cr_funds_fund_type ON public.cr_funds(fund_type);
CREATE INDEX idx_cr_funds_country_base ON public.cr_funds(country_base);
CREATE INDEX idx_cr_funds_is_deleted ON public.cr_funds(is_deleted);
CREATE INDEX idx_cr_funds_sector_focus ON public.cr_funds USING GIN(sector_focus);
CREATE INDEX idx_cr_funds_geography_focus ON public.cr_funds USING GIN(geography_focus);

CREATE INDEX idx_cr_people_fund_id ON public.cr_people(fund_id);
CREATE INDEX idx_cr_people_role ON public.cr_people(role);
CREATE INDEX idx_cr_people_email ON public.cr_people(email);
CREATE INDEX idx_cr_people_is_deleted ON public.cr_people(is_deleted);

CREATE INDEX idx_cr_portfolio_fund_id ON public.cr_portfolio(fund_id);
CREATE INDEX idx_cr_portfolio_status ON public.cr_portfolio(status);
CREATE INDEX idx_cr_portfolio_sector ON public.cr_portfolio(sector);
CREATE INDEX idx_cr_portfolio_is_deleted ON public.cr_portfolio(is_deleted);

CREATE INDEX idx_cr_lps_type ON public.cr_lps(type);
CREATE INDEX idx_cr_lps_country ON public.cr_lps(country);
CREATE INDEX idx_cr_lps_is_deleted ON public.cr_lps(is_deleted);

CREATE INDEX idx_cr_fund_lps_fund_id ON public.cr_fund_lps(fund_id);
CREATE INDEX idx_cr_fund_lps_lp_id ON public.cr_fund_lps(lp_id);

CREATE INDEX idx_cr_deals_fund_id ON public.cr_deals(fund_id);
CREATE INDEX idx_cr_deals_deal_type ON public.cr_deals(deal_type);
CREATE INDEX idx_cr_deals_deal_year ON public.cr_deals(deal_year);
CREATE INDEX idx_cr_deals_is_deleted ON public.cr_deals(is_deleted);

CREATE INDEX idx_cr_matches_fund_id ON public.cr_matches(fund_id);
CREATE INDEX idx_cr_matches_status ON public.cr_matches(status);
CREATE INDEX idx_cr_matches_crm_entity ON public.cr_matches(crm_entity_type, crm_entity_id);

CREATE INDEX idx_cr_fund_audit_log_fund_id ON public.cr_fund_audit_log(fund_id);
CREATE INDEX idx_cr_fund_audit_log_changed_at ON public.cr_fund_audit_log(changed_at);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_cr_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cr_funds_updated_at
  BEFORE UPDATE ON public.cr_funds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

CREATE TRIGGER update_cr_people_updated_at
  BEFORE UPDATE ON public.cr_people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

CREATE TRIGGER update_cr_portfolio_updated_at
  BEFORE UPDATE ON public.cr_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

CREATE TRIGGER update_cr_lps_updated_at
  BEFORE UPDATE ON public.cr_lps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

CREATE TRIGGER update_cr_deals_updated_at
  BEFORE UPDATE ON public.cr_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

CREATE TRIGGER update_cr_matches_updated_at
  BEFORE UPDATE ON public.cr_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cr_updated_at();

-- =====================================================
-- TRIGGER para Auditoría de cr_funds
-- =====================================================

CREATE OR REPLACE FUNCTION public.log_cr_fund_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_field TEXT;
  old_val TEXT;
  new_val TEXT;
  fields_to_track TEXT[] := ARRAY[
    'name', 'fund_type', 'website', 'country_base', 'status', 'founded_year',
    'aum', 'current_fund_number', 'current_fund_size', 'description',
    'ticket_min', 'ticket_max', 'ebitda_min', 'ebitda_max', 'revenue_min', 'revenue_max',
    'notes_internal', 'source_url'
  ];
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cr_fund_audit_log (fund_id, action, changed_by)
    VALUES (NEW.id, 'INSERT', auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    FOREACH changed_field IN ARRAY fields_to_track
    LOOP
      EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', changed_field, changed_field)
      INTO old_val, new_val
      USING OLD, NEW;
      
      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO public.cr_fund_audit_log (fund_id, action, field_name, old_value, new_value, changed_by)
        VALUES (NEW.id, 'UPDATE', changed_field, old_val, new_val, auth.uid());
      END IF;
    END LOOP;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.cr_fund_audit_log (fund_id, action, changed_by)
    VALUES (OLD.id, 'DELETE', auth.uid());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER cr_fund_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cr_funds
  FOR EACH ROW
  EXECUTE FUNCTION public.log_cr_fund_changes();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.cr_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_lps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_fund_lps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cr_fund_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para cr_funds
CREATE POLICY "Admin users can view all cr_funds"
  ON public.cr_funds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_funds"
  ON public.cr_funds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_funds"
  ON public.cr_funds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_funds"
  ON public.cr_funds FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_people
CREATE POLICY "Admin users can view all cr_people"
  ON public.cr_people FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_people"
  ON public.cr_people FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_people"
  ON public.cr_people FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_people"
  ON public.cr_people FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_portfolio
CREATE POLICY "Admin users can view all cr_portfolio"
  ON public.cr_portfolio FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_portfolio"
  ON public.cr_portfolio FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_portfolio"
  ON public.cr_portfolio FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_portfolio"
  ON public.cr_portfolio FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_lps
CREATE POLICY "Admin users can view all cr_lps"
  ON public.cr_lps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_lps"
  ON public.cr_lps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_lps"
  ON public.cr_lps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_lps"
  ON public.cr_lps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_fund_lps
CREATE POLICY "Admin users can view all cr_fund_lps"
  ON public.cr_fund_lps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_fund_lps"
  ON public.cr_fund_lps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_fund_lps"
  ON public.cr_fund_lps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_fund_lps"
  ON public.cr_fund_lps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_deals
CREATE POLICY "Admin users can view all cr_deals"
  ON public.cr_deals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_deals"
  ON public.cr_deals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_deals"
  ON public.cr_deals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_deals"
  ON public.cr_deals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_matches
CREATE POLICY "Admin users can view all cr_matches"
  ON public.cr_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can insert cr_matches"
  ON public.cr_matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can update cr_matches"
  ON public.cr_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admin users can delete cr_matches"
  ON public.cr_matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Políticas para cr_fund_audit_log
CREATE POLICY "Admin users can view all cr_fund_audit_log"
  ON public.cr_fund_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "System can insert cr_fund_audit_log"
  ON public.cr_fund_audit_log FOR INSERT
  WITH CHECK (true);
