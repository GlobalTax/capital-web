
INSERT INTO public.rod_list_members (language, full_name, email, company, phone, notes)
SELECT DISTINCT ON (LOWER(TRIM(olc.email)))
  'es',
  COALESCE(olc.contacto, 'Sin nombre'),
  LOWER(TRIM(olc.email)),
  olc.empresa,
  olc.telefono,
  olc.notas
FROM public.outbound_list_companies olc
WHERE olc.list_id IN ('7a76cb60-a5c4-457e-a483-019c92493b96', '8bf94e51-fa52-4bb6-8ae4-9caf87353ecf')
  AND olc.deleted_at IS NULL
  AND olc.email IS NOT NULL
  AND TRIM(olc.email) != ''
ORDER BY LOWER(TRIM(olc.email)), olc.created_at ASC
ON CONFLICT (language, email) DO NOTHING;
