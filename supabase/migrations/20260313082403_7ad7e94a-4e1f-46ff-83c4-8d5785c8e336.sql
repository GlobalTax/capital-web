
CREATE TABLE public.linkedin_format_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.linkedin_format_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read linkedin_format_options"
  ON public.linkedin_format_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert linkedin_format_options"
  ON public.linkedin_format_options FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete linkedin_format_options"
  ON public.linkedin_format_options FOR DELETE TO authenticated USING (true);

INSERT INTO public.linkedin_format_options (value, label) VALUES
  ('carousel', 'Carrusel'),
  ('long_text', 'Texto largo'),
  ('infographic', 'Infografía'),
  ('opinion', 'Opinión'),
  ('storytelling', 'Storytelling'),
  ('data_highlight', 'Dato destacado');
