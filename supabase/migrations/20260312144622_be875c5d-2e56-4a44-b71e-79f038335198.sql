ALTER TABLE public.valuation_campaigns
ADD COLUMN cc_recipient_ids UUID[] DEFAULT NULL;