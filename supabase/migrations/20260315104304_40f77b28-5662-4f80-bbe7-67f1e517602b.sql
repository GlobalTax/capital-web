
-- Create lead-magnets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-magnets', 'lead-magnets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access on lead-magnets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'lead-magnets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload on lead-magnets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lead-magnets');

-- Insert the lead magnet record
INSERT INTO public.lead_magnets (title, type, sector, description, file_url, status, landing_page_slug, meta_title, meta_description)
VALUES (
  'Guía Completa para Vender tu Empresa',
  'report',
  'general',
  'Guía profesional de 12 capítulos con todo lo que necesitas saber antes de vender tu empresa: valoración, due diligence, fiscalidad, negociación y checklist de preparación.',
  '/downloads/guia-vender-empresa-capittal.pdf',
  'active',
  'guia-vender-empresa',
  'Guía Gratuita para Vender tu Empresa | Capittal M&A',
  'Descarga gratis la guía completa de 12 capítulos para vender tu empresa. Valoración, due diligence, fiscalidad y checklist de preparación.'
);
