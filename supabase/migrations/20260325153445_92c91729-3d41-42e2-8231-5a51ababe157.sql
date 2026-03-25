-- Remove duplicate campaign_presentations, keeping the most recently updated row per (campaign_id, company_id)
DELETE FROM public.campaign_presentations
WHERE id NOT IN (
  SELECT DISTINCT ON (campaign_id, company_id) id
  FROM public.campaign_presentations
  ORDER BY campaign_id, company_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
);

-- Now add the unique constraint
ALTER TABLE public.campaign_presentations
ADD CONSTRAINT campaign_presentations_campaign_company_unique
UNIQUE (campaign_id, company_id);