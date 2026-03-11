ALTER TABLE public.valuation_campaign_companies
  ADD COLUMN IF NOT EXISTS client_website text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS client_provincia text DEFAULT NULL;