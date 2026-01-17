-- Create table for storing contacts imported from Brevo
CREATE TABLE public.brevo_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brevo_id BIGINT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  sms TEXT,
  company TEXT,
  attributes JSONB DEFAULT '{}',
  list_ids INTEGER[] DEFAULT '{}',
  list_names TEXT[] DEFAULT '{}',
  email_blacklisted BOOLEAN DEFAULT false,
  sms_blacklisted BOOLEAN DEFAULT false,
  brevo_created_at TIMESTAMPTZ,
  brevo_modified_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_synced_to_crm BOOLEAN DEFAULT false,
  crm_entity_id UUID,
  crm_entity_type TEXT,
  import_batch_id UUID,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.brevo_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated admin access
CREATE POLICY "Admin users can manage brevo_contacts"
  ON public.brevo_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create indexes for faster queries
CREATE INDEX idx_brevo_contacts_email ON public.brevo_contacts(email);
CREATE INDEX idx_brevo_contacts_brevo_id ON public.brevo_contacts(brevo_id);
CREATE INDEX idx_brevo_contacts_imported_at ON public.brevo_contacts(imported_at DESC);
CREATE INDEX idx_brevo_contacts_is_synced ON public.brevo_contacts(is_synced_to_crm);

-- Create updated_at trigger
CREATE TRIGGER update_brevo_contacts_updated_at
  BEFORE UPDATE ON public.brevo_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.brevo_contacts IS 'Contacts imported from Brevo platform for CRM integration';