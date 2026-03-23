

## Corregir la asociación automática para que replique exactamente la asociación manual en el perfil CRM

### Diagnóstico real
He revisado la lógica actual y el problema no está en el diálogo manual: ese flujo sí funciona porque escribe directamente en `contactos.empresa_principal_id`, que es justo lo que usa el perfil CRM/GoDeal para mostrar la pestaña de contactos.

La asociación automática falla por dos razones:

1. **La sincronización automática está intentando apoyarse en `external_capittal_id`**
   - pero ese campo está contaminado en muchos contactos históricos
   - ahora mismo hay **500 contactos** cuyo `external_capittal_id` apunta a su **propio `contactos.id`**, no al `contact_leads.id`
   - además, esos 500 anchors ni siquiera apuntan a leads existentes

2. **Ya existe un vínculo mejor y más fiable: `contact_leads.crm_contacto_id`**
   - el sistema ya lo guarda en muchos leads
   - pero la función nueva de sync no lo usa como referencia principal
   - resultado: el automático no reproduce la misma asociación que haces tú manualmente

### Qué voy a cambiar
La idea es que la asociación automática haga exactamente esto:

```text
contact_lead
  -> crm_contacto_id (contacto real)
  -> empresa_id del lead
  -> actualizar contactos.empresa_principal_id
```

Es decir:
- el **lead**
- el **contacto CRM**
- y la **empresa**
quedan unidos siempre sobre el mismo registro real de `contactos`.

---

## Plan de implementación

### 1. Rehacer la lógica automática para usar `crm_contacto_id` como referencia principal
Actualizar la función SQL de sincronización para que el orden sea:

1. Si `NEW.crm_contacto_id` existe:
   - usar ese contacto directamente
   - actualizar `contactos.empresa_principal_id = NEW.empresa_id`
   - completar nombre/teléfono si faltan
2. Si no hay `crm_contacto_id`, entonces:
   - buscar por `external_capittal_id = NEW.id`
3. Si tampoco existe:
   - buscar por email normalizado
4. Si no existe nada:
   - crear el contacto y guardar:
     - `empresa_principal_id`
     - `external_capittal_id = NEW.id`
   - además dejar `crm_contacto_id` apuntando al contacto creado

Con esto el automático usará primero el mismo contacto que ya reconoce el CRM.

### 2. Mantener sincronización continua cuando cambie el lead
Ampliar el trigger `AFTER INSERT OR UPDATE` de `contact_leads` para que también reaccione a cambios en:

- `crm_contacto_id`
- `empresa_id`
- `email`
- `full_name`
- `phone`
- `company`
- `is_deleted`

Así, si el lead se corrige o se religa, el perfil CRM se corrige solo.

### 3. Backfill robusto sobre datos existentes
Hacer una migración de saneamiento para:

- corregir leads que ya tienen `crm_contacto_id` pero cuyo contacto está en otra empresa
- rellenar `empresa_principal_id` en el contacto correcto
- rellenar `external_capittal_id` solo cuando falte o esté mal
- crear contacto solo si no existe ninguno

Esto permitirá que lo ya capturado aparezca también automáticamente en el perfil CRM.

### 4. Dejar de confiar en anchors históricos rotos
No usar `external_capittal_id` histórico como fuente de verdad si:
- apunta a un UUID que no existe en `contact_leads`
- o entra en conflicto con `crm_contacto_id`

La prioridad debe quedar así:

```text
crm_contacto_id > external_capittal_id válido > email
```

### 5. Ajustar el punto de entrada donde se crea el lead
En `send-form-notifications`, reforzar que cuando se crea o encuentra un contacto:

- ese `contactoId` se guarde siempre en `contact_leads.crm_contacto_id`
- y el contacto ya quede con `empresa_principal_id = empresaId`

Eso reduce dependencia del trigger posterior y deja el dato bien desde origen.

---

## Archivos / zonas a tocar

### Base de datos
**Nueva migración SQL**
- Reemplazar `sync_contact_lead_to_contacto()`
- Recrear trigger `trg_sync_contact_lead_to_contacto`
- Ejecutar backfill correctivo

### Edge Function
**`supabase/functions/send-form-notifications/index.ts`**
- reforzar upsert del contacto
- asegurar consistencia entre:
  - `contact_leads.crm_contacto_id`
  - `contact_leads.empresa_id`
  - `contactos.empresa_principal_id`

---

## Lo que NO hace falta tocar
No hace falta modificar la UI del perfil de empresa ni el diálogo manual para resolver este bug.

El comportamiento manual ya demuestra cuál es el dato que el CRM necesita:
- `contactos.empresa_principal_id`

El fallo está en cómo llega ahí la asociación automática.

---

## Resultado esperado
Después del cambio:

- si entra un `contact_lead`, el contacto aparecerá automáticamente en la empresa correcta
- el perfil CRM mostrará el mismo vínculo que hoy puedes crear manualmente
- si el lead ya tiene `crm_contacto_id`, ese será el contacto oficial
- si cambia el lead, el contacto se re-sincronizará solo
- empresa, lead y contacto irán siempre “de la mano”

## Detalle técnico clave
El mayor hallazgo es este:

- la lógica actual se apoya demasiado en `external_capittal_id`
- pero ese campo está históricamente contaminado en muchos registros
- el campo fiable para replicar la asociación manual es `contact_leads.crm_contacto_id`

Por tanto, la corrección buena no es “seguir afinando email matching”, sino **cambiar la fuente de verdad de la sincronización**.

