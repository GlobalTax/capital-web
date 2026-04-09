
DELETE FROM public.rod_list_members WHERE language = 'es';

INSERT INTO public.rod_list_members (language, email, full_name, company)
SELECT DISTINCT ON (LOWER(TRIM(email)))
  'es',
  LOWER(TRIM(email)),
  COALESCE(contacto, empresa),
  empresa
FROM public.outbound_list_companies
WHERE list_id = '7a76cb60-a5c4-457e-a483-019c92493b96'
  AND deleted_at IS NULL
  AND email IS NOT NULL 
  AND TRIM(email) != ''
ORDER BY LOWER(TRIM(email)), created_at DESC;
