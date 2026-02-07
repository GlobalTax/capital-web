

# Plan: Persistir Descripcion y Etiquetas en la Empresa (empresas)

## Diagnostico

**Estado actual (por que "no persiste"):**

El guardado funciona, pero guarda en la tabla del **lead** (`contact_leads.ai_company_summary`, `company_valuations.ai_company_summary`), no en la tabla de la **empresa** (`empresas`). Esto significa:
- Si abres otro lead de la MISMA empresa, no aparece la descripcion
- Si el lead no tiene `crm_empresa_id` vinculado, la descripcion queda huerfana
- La tabla `empresas` no tiene campos para AI (no existe `activity_description` ni `sector_tags`)

**Datos clave:**
- 142 de 186 contact_leads tienen `crm_empresa_id` vinculado a `empresas`
- La tabla `empresas` tiene `descripcion` (generico) pero NO campos AI
- El hook `useSaveContactClassification` guarda atomicamente en la tabla del lead (funciona correctamente para leads)

## Solucion

Doble persistencia: guardar en el lead (como hasta ahora) Y en la empresa vinculada. Si la empresa no tiene `crm_empresa_id`, solo guarda en el lead.

---

### 1. Migracion SQL: Anadir campos AI a `empresas`

```sql
ALTER TABLE empresas ADD COLUMN ai_company_summary TEXT;
ALTER TABLE empresas ADD COLUMN ai_company_summary_at TIMESTAMPTZ;
ALTER TABLE empresas ADD COLUMN ai_sector_pe TEXT;
ALTER TABLE empresas ADD COLUMN ai_sector_name TEXT;
ALTER TABLE empresas ADD COLUMN ai_tags TEXT[];
ALTER TABLE empresas ADD COLUMN ai_business_model_tags TEXT[];
ALTER TABLE empresas ADD COLUMN ai_negative_tags TEXT[];
ALTER TABLE empresas ADD COLUMN ai_classification_confidence INTEGER;
ALTER TABLE empresas ADD COLUMN ai_classification_at TIMESTAMPTZ;
```

Son exactamente los mismos campos que ya existen en `contact_leads` y `company_valuations`, usando los mismos tipos.

---

### 2. Modificar `useSaveContactClassification.ts`

Despues del guardado exitoso en la tabla del lead, hacer un segundo update a `empresas` si existe `empresaId`:

```text
Flujo actual:
  1. Construir updateData
  2. UPDATE lead_table SET ... WHERE id = contactId
  3. Return success

Flujo nuevo:
  1. Construir updateData
  2. UPDATE lead_table SET ... WHERE id = contactId
  3. SI empresaId proporcionado:
     UPDATE empresas SET mismos campos WHERE id = empresaId
     (error aqui = warning, no bloquea)
  4. Return success
```

Cambios en la interfaz:
- `SaveClassificationParams` recibe nuevo campo opcional `empresaId?: string`
- Si viene `empresaId`, se propaga a `empresas`
- Si falla el update a empresas (RLS, etc.), se muestra warning pero no se bloquea el guardado del lead

---

### 3. Modificar `ActivityClassificationBlock.tsx`

- Recibir nueva prop `empresaId?: string`
- Pasar `empresaId` al hook `saveClassification`
- Al cargar el componente: si no hay `initialDescription` en el lead, intentar cargar desde `empresas` (fallback)

---

### 4. Modificar `ContactDetailSheet.tsx`

- Pasar `empresaId={contact.empresa_id}` a `ActivityClassificationBlock`
- La prop `empresa_id` ya existe en `UnifiedContact` (se popula desde `crm_empresa_id`)

---

### 5. Fallback: Cargar desde empresa al abrir panel

Cuando se abre el panel lateral:
- Si el lead tiene `ai_company_summary` -> usarlo (prioridad)
- Si el lead NO tiene `ai_company_summary` pero tiene `empresa_id` -> hacer query a `empresas` para cargar los datos
- Esto asegura que si otro lead de la misma empresa ya genero la descripcion, se reutiliza

Esto se implementa como un `useEffect` dentro de `ActivityClassificationBlock` que hace la query de fallback.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| SQL Migration | ADD COLUMN x9 campos AI en `empresas` |
| `src/hooks/useSaveContactClassification.ts` | Aceptar `empresaId`, doble UPDATE (lead + empresa) |
| `src/components/admin/contacts/ActivityClassificationBlock.tsx` | Prop `empresaId`, fallback de carga desde empresa |
| `src/components/admin/contacts/ContactDetailSheet.tsx` | Pasar `empresaId={contact.empresa_id}` |

## Lo que NO se toca

- Estructura de `contact_leads`, `company_valuations` (intacta)
- Datos historicos de AI en leads (se mantienen)
- Flujo de generacion de descripcion y tags (sin cambios)
- Hooks `useCompanyActivityDescription` y `useSectorTagsGenerator` (sin cambios)
- Logica de filtros, tabla, pipeline (sin cambios)

## Verificaciones post-implementacion

1. Lead CON empresa_id: generar descripcion -> guardar -> verificar que `empresas.ai_company_summary` se actualiza
2. Lead SIN empresa_id: generar -> guardar -> funciona como antes (solo en lead)
3. Abrir OTRO lead de la MISMA empresa -> descripcion aparece automaticamente (fallback desde empresa)
4. Recargar pagina -> datos persisten
5. Verificar en Supabase SQL: `SELECT ai_company_summary FROM empresas WHERE id = 'xxx'` muestra el valor

