

## Auto-vincular contacto a empresa cuando se crea un contact_lead

### Problema
El trigger `auto_link_contact_lead_to_empresa` vincula el contact_lead a una empresa (vía `empresa_id`), pero NO crea un registro en la tabla `contactos` con `empresa_principal_id`. Por eso la pestaña "Contactos" de la empresa en GoDeal aparece vacía.

### Solución

**Migración SQL**: Ampliar la función `auto_link_contact_lead_to_empresa` para que, además de asignar `empresa_id`, también inserte (o vincule) un registro en `contactos`:

1. Buscar en `contactos` si ya existe uno con el mismo email y `empresa_principal_id` = la empresa
2. Si no existe, buscar por email sin empresa vinculada y asignarle la empresa
3. Si no existe en absoluto, crear nuevo registro en `contactos` con nombre, email, teléfono y `empresa_principal_id`

**Backfill**: Un UPDATE/INSERT masivo para vincular los contact_leads existentes que ya tienen `empresa_id` pero no tienen registro correspondiente en `contactos`.

### Detalle del trigger actualizado

```sql
-- Después de asignar NEW.empresa_id...

-- Auto-crear/vincular contacto en tabla contactos
IF NOT EXISTS (
  SELECT 1 FROM contactos 
  WHERE email = NEW.email 
  AND empresa_principal_id = v_empresa_id
) THEN
  -- Buscar contacto existente por email sin empresa
  SELECT id INTO v_contacto_id FROM contactos 
  WHERE email = NEW.email AND empresa_principal_id IS NULL LIMIT 1;
  
  IF v_contacto_id IS NOT NULL THEN
    UPDATE contactos SET empresa_principal_id = v_empresa_id WHERE id = v_contacto_id;
  ELSE
    INSERT INTO contactos (nombre, email, telefono, empresa_principal_id, source)
    VALUES (NEW.full_name, NEW.email, NEW.phone, v_empresa_id, 'lead');
  END IF;
END IF;
```

### Resultado
Cada vez que entra un lead → se crea empresa + se crea contacto vinculado. La pestaña "Contactos" de GoDeal mostrara siempre el contacto asociado automáticamente.

