-- Add acquisition_channel_id and lead_entry_date to company_valuations
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS acquisition_channel_id UUID REFERENCES public.acquisition_channels(id),
ADD COLUMN IF NOT EXISTS lead_entry_date TIMESTAMPTZ;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_company_valuations_acquisition_channel 
ON public.company_valuations(acquisition_channel_id);

-- Add comment for documentation
COMMENT ON COLUMN public.company_valuations.acquisition_channel_id IS 'Canal de adquisición del lead (Meta, Ads, Orgánico, etc.)';
COMMENT ON COLUMN public.company_valuations.lead_entry_date IS 'Fecha de entrada manual del lead, puede diferir de created_at';