-- Create banners table for dynamic banner management
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  subtitle text,
  cta_text text,
  cta_href text,
  variant text NOT NULL DEFAULT 'solid' CHECK (variant IN ('solid', 'gradient', 'soft', 'outline')),
  color_primary text NOT NULL DEFAULT '#1d4ed8',
  color_secondary text,
  text_on_primary text DEFAULT '#ffffff',
  position text NOT NULL DEFAULT 'top' CHECK (position IN ('top', 'bottom')),
  dismissible boolean NOT NULL DEFAULT true,
  rounded text NOT NULL DEFAULT '2xl',
  shadow boolean NOT NULL DEFAULT true,
  align text NOT NULL DEFAULT 'left' CHECK (align IN ('left', 'center')),
  max_width text NOT NULL DEFAULT '7xl' CHECK (max_width IN ('none', '7xl')),
  visible boolean NOT NULL DEFAULT false,
  audience text[] NOT NULL DEFAULT '{all}',
  pages text[] NOT NULL DEFAULT '{all}',
  start_at timestamptz,
  end_at timestamptz,
  priority integer NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_banners_visible ON public.banners (visible);
CREATE INDEX idx_banners_schedule ON public.banners (start_at, end_at);
CREATE INDEX idx_banners_priority ON public.banners (priority DESC);

-- Enable Row Level Security
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anonymous and authenticated users)
CREATE POLICY "read_public_banners" ON public.banners
  FOR SELECT
  USING (
    visible = true
    AND (start_at IS NULL OR start_at <= now())
    AND (end_at IS NULL OR end_at >= now())
  );

-- Policy for admin/manager management access
CREATE POLICY "manage_banners" ON public.banners
  FOR ALL
  USING (
    auth.role() = 'service_role'
    OR (
      auth.uid() IS NOT NULL 
      AND (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'role' = 'manager'
        OR current_user_is_admin()
      )
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR (
      auth.uid() IS NOT NULL 
      AND (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'role' = 'manager'
        OR current_user_is_admin()
      )
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_banners_updated_at();