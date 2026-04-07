-- Table to link outbound company lists to the ROD (one per language)
CREATE TABLE public.rod_list_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  language TEXT NOT NULL CHECK (language IN ('es', 'en')),
  outbound_list_id UUID NOT NULL REFERENCES public.outbound_lists(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language)
);

ALTER TABLE public.rod_list_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rod_list_config"
  ON public.rod_list_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage rod_list_config"
  ON public.rod_list_config FOR ALL
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
