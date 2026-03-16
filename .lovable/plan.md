

## Plan: Sincronizar datos de contacto de sublistas a listas madre

### Diagnóstico

El trigger `sync_sublist_company_to_madre` funciona correctamente para **nuevas inserciones y actualizaciones**, pero hay **168 registros** en listas madre que no tienen datos de contacto aunque sus sublistas sí los tienen. Esto ocurrió porque:

1. Las empresas se insertaron en la lista madre **antes** de que el trigger existiera
2. Los datos de contacto se añadieron a las sublistas **después** de la inserción inicial (vía UPDATE), pero en un momento en que el trigger aún no estaba activo

El trigger actual ya cubre INSERT y UPDATE futuros. Solo falta un **backfill** de los datos históricos.

### Solución

Ejecutar una migración SQL que actualice los 168 registros de listas madre con los datos de contacto disponibles en sus sublistas, usando la misma lógica COALESCE del trigger:

```sql
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
  ORDER BY LOWER(TRIM(s.cif)), m_list.id, s.updated_at DESC
) s
WHERE m.list_id = s.madre_list_id
  AND LOWER(TRIM(m.cif)) = LOWER(TRIM(s.cif))
  AND (m.contacto IS NULL OR m.contacto = '');
```

### Cambio

Solo **una migración SQL**. No hay cambios en código — el trigger ya cubre los casos futuros.

