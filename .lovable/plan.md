

## Plan: Auto-sincronizar Leads Inversores → Listados ROD

### Contexto
Cuando alguien descarga la ROD, sus datos se guardan en `buyer_contacts` (visible en "Leads Inversores"). Pero actualmente NO se añaden automáticamente a `rod_list_members` (visible en "Listados ROD"). El usuario quiere que este paso sea automático.

### Datos actuales
- `buyer_contacts` tiene 19 registros ROD (15 ES, 4 EN), con `source = 'ROD Download – LinkedIn'` y `preferred_language` = 'es'/'en'
- `rod_list_members` tiene unique constraint en `(language, email)` — perfecto para upsert sin duplicados

### Solución: Trigger en base de datos

Crear un trigger en `buyer_contacts` que, al insertar un nuevo registro con source que contenga "ROD", automáticamente haga upsert en `rod_list_members` con el idioma correspondiente (`preferred_language`).

**Migración SQL:**

```sql
CREATE OR REPLACE FUNCTION sync_buyer_contact_to_rod_list()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo sincronizar leads que vienen de descarga ROD
  IF NEW.source ILIKE '%ROD%' AND NEW.email IS NOT NULL THEN
    INSERT INTO rod_list_members (language, full_name, email, company, phone, sector)
    VALUES (
      COALESCE(NEW.preferred_language, 'es'),
      COALESCE(NEW.full_name, CONCAT(NEW.first_name, ' ', NEW.last_name)),
      LOWER(TRIM(NEW.email)),
      NEW.company,
      NEW.phone,
      NEW.sectors_of_interest
    )
    ON CONFLICT (language, email) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      company = EXCLUDED.company,
      phone = EXCLUDED.phone,
      sector = EXCLUDED.sector,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sync_buyer_to_rod_list
AFTER INSERT ON buyer_contacts
FOR EACH ROW
EXECUTE FUNCTION sync_buyer_contact_to_rod_list();
```

Además, migrar los 19 registros existentes que aún no están en `rod_list_members`:

```sql
INSERT INTO rod_list_members (language, full_name, email, company, phone, sector)
SELECT 
  COALESCE(preferred_language, 'es'),
  COALESCE(full_name, CONCAT(first_name, ' ', last_name)),
  LOWER(TRIM(email)),
  company,
  phone,
  sectors_of_interest
FROM buyer_contacts
WHERE source ILIKE '%ROD%' AND email IS NOT NULL
ON CONFLICT (language, email) DO NOTHING;
```

### Resultado
- Cada nueva descarga ROD → el contacto aparece automáticamente en el listado ROD del idioma correcto (ES o EN)
- "Leads Inversores" = quién se descargó la ROD
- "Listados ROD" = a quién se envía la ROD (se alimenta solo)
- Sin cambios en el frontend — todo ocurre en la base de datos

