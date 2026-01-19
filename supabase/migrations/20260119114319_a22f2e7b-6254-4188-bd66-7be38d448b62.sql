-- Create lead_forms reference table
CREATE TABLE public.lead_forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lead_forms ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active forms
CREATE POLICY "Anyone can read active lead forms"
  ON public.lead_forms FOR SELECT
  USING (is_active = true);

-- Policy: Admins can manage forms
CREATE POLICY "Admins can manage lead forms"
  ON public.lead_forms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Insert initial values
INSERT INTO public.lead_forms (id, name, display_order) VALUES
  ('form_enero_2025_compra', 'Formulario Enero 2025 · Compra', 1),
  ('form_nov_2025_negocios', 'Formulario Noviembre 2025 · Negocios', 2),
  ('form_nov_2025_empresarios', 'Formulario Noviembre 2025 · Empresarios', 3);

-- Add lead_form column to all lead tables
ALTER TABLE public.contact_leads ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.company_valuations ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.general_contact_leads ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.collaborator_applications ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.acquisition_leads ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.company_acquisition_inquiries ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);
ALTER TABLE public.advisor_valuations ADD COLUMN lead_form TEXT REFERENCES public.lead_forms(id);

-- Create indexes for filtering
CREATE INDEX idx_contact_leads_lead_form ON public.contact_leads(lead_form);
CREATE INDEX idx_company_valuations_lead_form ON public.company_valuations(lead_form);
CREATE INDEX idx_general_contact_leads_lead_form ON public.general_contact_leads(lead_form);
CREATE INDEX idx_collaborator_applications_lead_form ON public.collaborator_applications(lead_form);
CREATE INDEX idx_acquisition_leads_lead_form ON public.acquisition_leads(lead_form);
CREATE INDEX idx_company_acquisition_inquiries_lead_form ON public.company_acquisition_inquiries(lead_form);
CREATE INDEX idx_advisor_valuations_lead_form ON public.advisor_valuations(lead_form);