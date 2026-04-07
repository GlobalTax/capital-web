
DELETE FROM public.rod_list_members
WHERE language = 'es'
AND email NOT IN (
  SELECT LOWER(TRIM(olc.email))
  FROM public.outbound_list_companies olc
  WHERE olc.list_id = '7a76cb60-a5c4-457e-a483-019c92493b96'
  AND olc.deleted_at IS NULL
  AND olc.email IS NOT NULL AND TRIM(olc.email) != ''
);
