

## Corregir vinculación automática para que lead, contacto y empresa vayan siempre unidos

### Qué está pasando ahora
He revisado la lógica actual y el problema no es del pipeline, sino de la sincronización en base de datos:

- El trigger `auto_link_contact_lead_to_empresa` solo asegura `contact_leads.empresa_id`
- La sincronización hacia `contactos` no está unificada en el mismo flujo
- El backfill reciente solo actualiza contactos cuyo `empresa_principal_id IS NULL`
- Si ya existe un contacto con ese email pero vinculado a otra empresa, no se corrige

Resultado real en BD ahora mismo:
- `216` `contact_leads` ya tienen `empresa_id`
- `211` ya tienen contacto vinculado correctamente
- `5` siguen desalineados
- Además, la solución actual no garantiza re-sincronización si el lead cambia después

### Plan
**Objetivo:** que cada oportunidad tenga un único vínculo consistente:
`contact_lead -> empresa_id -> contacto(empresa_principal_id)`  
y que ese vínculo se mantenga automáticamente siempre.

### Implementación

#### 1. Unificar la lógica en una sola función de sincronización
Crear una función SQL dedicada, por ejemplo `sync_contact_lead_to_contacto()`, que:

- reciba los datos del `contact_lead`
- busque primero por `external_capittal_id = contact_lead.id`
- si no existe, busque por email normalizado
- si existe contacto con ese email:
  - actualice `empresa_principal_id`
  - actualice nombre/teléfono si faltan o están vacíos
  - guarde `external_capittal_id = contact_lead.id`
- si no existe:
  - cree el contacto con:
    - `nombre`
    - `email`
    - `telefono`
    - `empresa_principal_id`
    - `source = 'lead'`
    - `external_capittal_id = contact_lead.id`

Esto evita depender solo del email y deja una relación estable entre lead y contacto.

#### 2. Hacer que se ejecute siempre, no solo al insertar
Mantener el trigger que asigna `empresa_id`, pero añadir sincronización también en cambios posteriores:

- `BEFORE INSERT` en `contact_leads`:
  - seguir resolviendo/creando empresa
- `AFTER INSERT OR UPDATE` en `contact_leads`:
  - ejecutar la sincronización a `contactos`

Debe dispararse al cambiar cualquiera de estos campos:
- `empresa_id`
- `email`
- `full_name`
- `phone`
- `company`
- `is_deleted`

Así no se rompe si el lead se corrige después manualmente.

#### 3. Corregir los datos ya existentes
Hacer un backfill robusto para:

- enlazar contactos existentes por `external_capittal_id`
- si no existe, enlazar por email normalizado
- corregir casos donde el contacto existe pero apunta a otra empresa
- insertar los contactos que falten
- rellenar `external_capittal_id` en los contactos creados desde leads

Esto resolverá los 5 casos detectados y dejará preparada la base para que no vuelva a pasar.

#### 4. Tratar los leads borrados o archivados
Definir comportamiento claro para no dejar basura lógica:

- si `contact_lead.is_deleted = true`, no crear nuevos contactos
- opcionalmente, no desasociar el contacto histórico de la empresa
- mantener el vínculo CRM salvo que quieras una política explícita de desvinculación

Mi recomendación: **no romper el vínculo histórico automáticamente**.

---

## Detalle técnico

### Causa raíz detectada
El SQL actual de backfill es demasiado conservador:

```sql
UPDATE contactos
SET empresa_principal_id = sub.empresa_id
WHERE LOWER(c.email) = LOWER(sub.email)
  AND c.empresa_principal_id IS NULL;
```

Eso deja fuera los casos donde:
- el contacto ya existe
- el email coincide
- pero `empresa_principal_id` ya apunta a otra empresa

Y justo esos son los que hoy siguen sin verse en GoDeal.

### Mejora clave
Usar `external_capittal_id` como ancla estable entre tablas:

- `contact_leads.id` -> `contactos.external_capittal_id`

Ventajas:
- evita depender solo del email
- permite re-sincronizar aunque cambie la empresa
- permite distinguir contactos históricos creados por otras vías

### Seguridad de datos
La corrección debe respetar:
- índice único `idx_contactos_email_unique`
- índice único `idx_contactos_external_capittal_id`

Por eso el backfill y la sincronización deben hacerse con orden de prioridad:
1. buscar por `external_capittal_id`
2. si no existe, buscar por email
3. si no existe, insertar

### Alcance
No hace falta tocar UI para resolver este bug.  
El problema está en la capa de sincronización de datos.

### Resultado esperado
Después del cambio:

- cada `contact_lead` con empresa tendrá siempre su contacto enlazado
- GoDeal mostrará ese contacto en la pestaña de contactos
- si cambia la empresa o el email del lead, el contacto se actualizará automáticamente
- lead y empresa quedarán siempre “de la mano”, como una única oportunidad vista desde dos entradas

