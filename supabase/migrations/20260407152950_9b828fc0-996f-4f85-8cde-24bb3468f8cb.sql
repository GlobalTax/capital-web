-- Table for ROD list members (independent from outbound_lists)
CREATE TABLE public.rod_list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL CHECK (language IN ('es', 'en')),
  full_name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  phone TEXT,
  sector TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language, email)
);

CREATE INDEX idx_rod_list_members_language ON public.rod_list_members(language);
CREATE INDEX idx_rod_list_members_email ON public.rod_list_members(language, email);

ALTER TABLE public.rod_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rod_list_members"
  ON public.rod_list_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage rod_list_members"
  ON public.rod_list_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_active = true
    )
  );
