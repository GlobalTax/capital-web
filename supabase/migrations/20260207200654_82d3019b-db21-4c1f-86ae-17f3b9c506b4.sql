
CREATE TABLE public.dealsuite_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT UNIQUE,
  telefono TEXT,
  deal_ids TEXT[] DEFAULT '{}',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.dealsuite_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage dealsuite_contacts"
ON public.dealsuite_contacts
FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
);
