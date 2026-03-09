
-- Create email_signatures table
CREATE TABLE IF NOT EXISTS email_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  job_title TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  website_url TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  confidentiality_note TEXT NOT NULL DEFAULT '',
  privacy_note TEXT NOT NULL DEFAULT '',
  extra_note TEXT NOT NULL DEFAULT '',
  html_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS (same pattern as campaign_emails)
ALTER TABLE email_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage email_signatures"
ON email_signatures FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Storage bucket for signature logos (public for email rendering)
INSERT INTO storage.buckets (id, name, public)
VALUES ('signature-assets', 'signature-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload signature assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'signature-assets');

CREATE POLICY "Authenticated users can update signature assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'signature-assets');

CREATE POLICY "Authenticated users can delete signature assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'signature-assets');

CREATE POLICY "Anyone can view signature assets"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'signature-assets');
