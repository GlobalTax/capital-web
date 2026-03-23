-- Backfill: for contact_leads with empresa_id but no matching contacto,
-- update existing contacto by email to link empresa (instead of inserting duplicate)
UPDATE contactos c
SET empresa_principal_id = sub.empresa_id, updated_at = NOW()
FROM (
  SELECT DISTINCT ON (LOWER(cl.email))
    cl.email,
    cl.empresa_id
  FROM contact_leads cl
  WHERE cl.empresa_id IS NOT NULL
    AND cl.email IS NOT NULL
    AND cl.is_deleted = false
    AND NOT EXISTS (
      SELECT 1 FROM contactos co
      WHERE LOWER(co.email) = LOWER(cl.email)
      AND co.empresa_principal_id = cl.empresa_id
    )
  ORDER BY LOWER(cl.email), cl.created_at DESC
) sub
WHERE LOWER(c.email) = LOWER(sub.email)
  AND c.empresa_principal_id IS NULL;

-- For truly missing contactos (no existing record at all), insert with conflict handling
INSERT INTO contactos (nombre, email, telefono, empresa_principal_id, source, created_at, updated_at)
SELECT DISTINCT ON (LOWER(cl.email))
  COALESCE(cl.full_name, cl.email),
  cl.email,
  cl.phone,
  cl.empresa_id,
  'lead',
  NOW(),
  NOW()
FROM contact_leads cl
WHERE cl.empresa_id IS NOT NULL
  AND cl.email IS NOT NULL
  AND cl.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM contactos co
    WHERE LOWER(co.email) = LOWER(cl.email)
  )
ORDER BY LOWER(cl.email), cl.created_at DESC;