-- Backfill: sincronizar datos de contacto de sublistas a listas madre
UPDATE outbound_list_companies m
SET
  contacto   = COALESCE(m.contacto, s.contacto),
  email      = COALESCE(m.email, s.email),
  telefono   = COALESCE(m.telefono, s.telefono),
  posicion_contacto = COALESCE(m.posicion_contacto, s.posicion_contacto),
  linkedin   = COALESCE(m.linkedin, s.linkedin)
FROM (
  SELECT DISTINCT ON (LOWER(TRIM(s.cif)), m_list.id)
    s.cif, m_list.id as madre_list_id,
    s.contacto, s.email, s.telefono,
    s.posicion_contacto, s.linkedin
  FROM outbound_list_companies s
  JOIN outbound_lists sl ON sl.id = s.list_id AND sl.lista_madre_id IS NOT NULL
  JOIN outbound_lists m_list ON m_list.id = sl.lista_madre_id
  WHERE s.contacto IS NOT NULL AND s.contacto != '' AND s.contacto != '_'
  ORDER BY LOWER(TRIM(s.cif)), m_list.id, s.created_at DESC
) s
WHERE m.list_id = s.madre_list_id
  AND LOWER(TRIM(m.cif)) = LOWER(TRIM(s.cif))
  AND (m.contacto IS NULL OR m.contacto = '');