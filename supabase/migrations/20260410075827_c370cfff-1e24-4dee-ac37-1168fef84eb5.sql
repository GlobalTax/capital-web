
-- Add acquisition_channel_id and lead_form to buyer_contacts
ALTER TABLE public.buyer_contacts
  ADD COLUMN IF NOT EXISTS acquisition_channel_id uuid REFERENCES public.acquisition_channels(id),
  ADD COLUMN IF NOT EXISTS lead_form text REFERENCES public.lead_forms(id);

-- Add acquisition_channel_id and lead_form to buyer_preferences
ALTER TABLE public.buyer_preferences
  ADD COLUMN IF NOT EXISTS acquisition_channel_id uuid REFERENCES public.acquisition_channels(id),
  ADD COLUMN IF NOT EXISTS lead_form text REFERENCES public.lead_forms(id);
