ALTER TABLE public.sell_leads
  ADD COLUMN IF NOT EXISTS acquisition_channel_id uuid REFERENCES public.acquisition_channels(id),
  ADD COLUMN IF NOT EXISTS lead_received_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS lead_form text REFERENCES public.lead_forms(id);