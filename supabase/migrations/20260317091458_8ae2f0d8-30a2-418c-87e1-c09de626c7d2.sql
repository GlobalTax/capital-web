
-- 1. Vincular la sublista a la lista madre
UPDATE outbound_lists 
SET lista_madre_id = '6913b433-6922-4863-81ab-d703cb8948d1'
WHERE id = 'ec0c18ae-bea5-4d5c-89f0-e50e2a757d4c';

-- 2. Backfill: enriquecer empresas existentes en la lista madre con datos de la sublista
UPDATE outbound_list_companies m SET
  email = COALESCE(NULLIF(m.email, ''), s.email),
  linkedin = COALESCE(NULLIF(m.linkedin, ''), s.linkedin),
  contacto = COALESCE(NULLIF(m.contacto, ''), s.contacto),
  director_ejecutivo = COALESCE(NULLIF(m.director_ejecutivo, ''), s.director_ejecutivo),
  telefono = COALESCE(NULLIF(m.telefono, ''), s.telefono),
  web = COALESCE(NULLIF(m.web, ''), s.web),
  posicion_contacto = COALESCE(NULLIF(m.posicion_contacto, ''), s.posicion_contacto)
FROM outbound_list_companies s
WHERE m.list_id = '6913b433-6922-4863-81ab-d703cb8948d1'
  AND s.list_id = 'ec0c18ae-bea5-4d5c-89f0-e50e2a757d4c'
  AND LOWER(TRIM(m.cif)) = LOWER(TRIM(s.cif))
  AND m.cif IS NOT NULL AND s.cif IS NOT NULL
  AND TRIM(m.cif) != '' AND TRIM(s.cif) != '';

-- 3. Insertar empresas nuevas que existen en la sublista pero no en la lista madre
INSERT INTO outbound_list_companies (
  list_id, empresa, contacto, email, telefono, cif, web, 
  provincia, facturacion, ebitda, anios_datos, notas, 
  num_trabajadores, director_ejecutivo, linkedin, 
  comunidad_autonoma, posicion_contacto, cnae, descripcion_actividad
)
SELECT 
  '6913b433-6922-4863-81ab-d703cb8948d1',
  s.empresa, s.contacto, s.email, s.telefono, s.cif, s.web,
  s.provincia, s.facturacion, s.ebitda, s.anios_datos, s.notas,
  s.num_trabajadores, s.director_ejecutivo, s.linkedin,
  s.comunidad_autonoma, s.posicion_contacto, s.cnae, s.descripcion_actividad
FROM outbound_list_companies s
WHERE s.list_id = 'ec0c18ae-bea5-4d5c-89f0-e50e2a757d4c'
  AND s.cif IS NOT NULL AND TRIM(s.cif) != ''
  AND NOT EXISTS (
    SELECT 1 FROM outbound_list_companies m
    WHERE m.list_id = '6913b433-6922-4863-81ab-d703cb8948d1'
      AND LOWER(TRIM(m.cif)) = LOWER(TRIM(s.cif))
  );
