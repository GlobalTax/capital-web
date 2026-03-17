

## Plan: Vincular sublista al listado madre y backfill de datos

### Situación actual
- **Lista madre** (`6913b433...`): 10.215 empresas, 0 emails, 0 linkedins
- **Sublista** (`ec0c18ae...`): 201 empresas con 200 emails y 187 linkedins, pero `lista_madre_id = null` (no vinculada)
- **Matches por CIF**: 197 empresas coinciden, 4 son nuevas
- Ya existe un trigger `sync_sublist_company_to_madre` que hace COALESCE en INSERT/UPDATE, pero no se activa porque la sublista nunca fue vinculada

### Acciones (2 operaciones SQL con el insert tool)

#### 1. Vincular la sublista a la lista madre
```sql
UPDATE outbound_lists 
SET lista_madre_id = '6913b433-6922-4863-81ab-d703cb8948d1'
WHERE id = 'ec0c18ae-bea5-4d5c-89f0-e50e2a757d4c';
```

#### 2. Backfill: enriquecer la lista madre con los datos existentes de la sublista
Para las 197 empresas que coinciden por CIF, enriquecer email, linkedin, contacto y demás campos vacíos. Para las 4 nuevas, insertarlas.

```sql
-- Enriquecer existentes (COALESCE mantiene dato madre si ya tiene valor)
UPDATE outbound_list_companies m SET
  email = COALESCE(NULLIF(m.email, ''), s.email),
  linkedin = COALESCE(NULLIF(m.linkedin, ''), s.linkedin),
  contacto = COALESCE(NULLIF(m.contacto, ''), s.contacto),
  director_ejecutivo = COALESCE(NULLIF(m.director_ejecutivo, ''), s.director_ejecutivo),
  telefono = COALESCE(NULLIF(m.telefono, ''), s.telefono),
  web = COALESCE(NULLIF(m.web, ''), s.web),
  posicion_contacto = COALESCE(NULLIF(m.posicion_contacto, ''), s.posicion_contacto)
FROM outbound_list_companies s
WHERE m.list_id = '6913b433-...'
  AND s.list_id = 'ec0c18ae-...'
  AND LOWER(TRIM(m.cif)) = LOWER(TRIM(s.cif));

-- Insertar las 4 empresas nuevas que no existen en la madre
INSERT INTO outbound_list_companies (list_id, empresa, contacto, email, ...)
SELECT '6913b433-...', empresa, contacto, email, ...
FROM outbound_list_companies
WHERE list_id = 'ec0c18ae-...'
  AND NOT EXISTS (...match by CIF...);
```

### Resultado esperado
- La sublista aparecerá como hija de la lista madre en la UI
- La lista madre tendrá ~200 emails y ~187 linkedins enriquecidos
- Futuros imports en la sublista sincronizarán automáticamente vía el trigger existente

### Sin cambios de código
Solo operaciones de datos. No se modifica ningún archivo.

