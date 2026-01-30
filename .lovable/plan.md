
# Plan: Migración de ENUM a TEXT para Estados Dinámicos

## Diagnóstico Confirmado

### Problema Raíz Identificado
El error `"invalid input value for enum lead_status: 'compras'"` ocurre porque:

1. **3 tablas principales** usan un ENUM `lead_status` para la columna `lead_status_crm`:
   - `company_valuations` (ENUM)
   - `contact_leads` (ENUM)  
   - `collaborator_applications` (ENUM)

2. **El ENUM solo tiene 15 valores fijos** predefinidos:
   - nuevo, contactando, calificado, propuesta_enviada, negociacion, en_espera, ganado, perdido, archivado, fase0_activo, fase0_bloqueado, mandato_propuesto, mandato_firmado, lead_perdido_curiosidad, ya_advisor

3. **El estado "Compras"** (`status_key: 'compras'`) fue creado dinámicamente en `contact_statuses` pero NO existe en el ENUM.

4. **4 tablas nuevas** ya usan TEXT correctamente (migración reciente del 30-01-2026):
   - `acquisition_leads` (TEXT)
   - `advisor_valuations` (TEXT)
   - `general_contact_leads` (TEXT)
   - `company_acquisition_inquiries` (TEXT)

### Datos Existentes
- `company_valuations`: ~1,087 registros con lead_status_crm (1077 "nuevo", 6 "calificado", 4 "contactando")
- Los valores actuales ya existen en `contact_statuses`, por lo que la migración es segura

---

## Solución: Migrar ENUM a TEXT

### Estrategia de Migración Segura

La migración se hará en **3 fases** para garantizar compatibilidad y cero pérdida de datos:

```text
FASE 1: Añadir columna temporal TEXT
         ↓
FASE 2: Migrar datos de ENUM → TEXT
         ↓
FASE 3: Reemplazar columna ENUM con TEXT
```

### Fase 1: Migración SQL

```sql
-- ==============================================================
-- MIGRACIÓN: ENUM lead_status → TEXT para estados dinámicos
-- ==============================================================

-- 1. COMPANY_VALUATIONS: Migrar de ENUM a TEXT
-- 1.1 Añadir columna temporal
ALTER TABLE public.company_valuations 
ADD COLUMN IF NOT EXISTS lead_status_text TEXT;

-- 1.2 Copiar datos del ENUM a TEXT
UPDATE public.company_valuations 
SET lead_status_text = lead_status_crm::TEXT
WHERE lead_status_crm IS NOT NULL;

-- 1.3 Eliminar la columna ENUM
ALTER TABLE public.company_valuations 
DROP COLUMN IF EXISTS lead_status_crm;

-- 1.4 Renombrar TEXT a lead_status_crm
ALTER TABLE public.company_valuations 
RENAME COLUMN lead_status_text TO lead_status_crm;

-- 1.5 Añadir default
ALTER TABLE public.company_valuations 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- 2. CONTACT_LEADS: Mismo proceso
ALTER TABLE public.contact_leads 
ADD COLUMN IF NOT EXISTS lead_status_text TEXT;

UPDATE public.contact_leads 
SET lead_status_text = lead_status_crm::TEXT
WHERE lead_status_crm IS NOT NULL;

ALTER TABLE public.contact_leads 
DROP COLUMN IF EXISTS lead_status_crm;

ALTER TABLE public.contact_leads 
RENAME COLUMN lead_status_text TO lead_status_crm;

ALTER TABLE public.contact_leads 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- 3. COLLABORATOR_APPLICATIONS: Mismo proceso
ALTER TABLE public.collaborator_applications 
ADD COLUMN IF NOT EXISTS lead_status_text TEXT;

UPDATE public.collaborator_applications 
SET lead_status_text = lead_status_crm::TEXT
WHERE lead_status_crm IS NOT NULL;

ALTER TABLE public.collaborator_applications 
DROP COLUMN IF EXISTS lead_status_crm;

ALTER TABLE public.collaborator_applications 
RENAME COLUMN lead_status_text TO lead_status_crm;

ALTER TABLE public.collaborator_applications 
ALTER COLUMN lead_status_crm SET DEFAULT 'nuevo';

-- 4. Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_company_valuations_status 
ON public.company_valuations(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_contact_leads_status 
ON public.contact_leads(lead_status_crm);

CREATE INDEX IF NOT EXISTS idx_collaborator_applications_status 
ON public.collaborator_applications(lead_status_crm);

-- 5. (Opcional) Eliminar el ENUM si ya no se usa
-- NOTA: Solo ejecutar si confirmamos que ninguna otra tabla lo usa
-- DROP TYPE IF EXISTS lead_status;
```

### Fase 2: No Se Requieren Cambios en Frontend

El código actual ya está preparado para TEXT:
- `useContactInlineUpdate` ya guarda `status_key` como string
- La validación existente verifica que el `status_key` existe en `contact_statuses`
- El hook `useContactStatuses` ya proporciona estados dinámicos

### Fase 3: Validación de Integridad (Opcional)

Añadir una restricción CHECK para validar que los valores existan en `contact_statuses`:

```sql
-- Función de validación (opcional)
CREATE OR REPLACE FUNCTION validate_status_key(p_status_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM contact_statuses 
    WHERE status_key = p_status_key
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Nota: NO añadimos CHECK constraint porque:
-- 1. Ralentizaría los inserts/updates
-- 2. La validación ya se hace en el frontend (useContactInlineUpdate)
-- 3. Permitiría mantener registros antiguos con estados legacy
```

---

## Archivos a Modificar

| Archivo | Tipo | Cambios |
|---------|------|---------|
| Nueva migración SQL | Crear | Migrar 3 tablas de ENUM a TEXT |

**NO se requieren cambios en frontend** porque:
1. El hook `useContactInlineUpdate` ya guarda `status_key` como string TEXT
2. La validación de estados ya existe y consulta `contact_statuses`
3. El sistema ya funciona con TEXT en las 4 tablas nuevas

---

## Pruebas de Validación Post-Migración

| Test | Resultado Esperado |
|------|-------------------|
| Crear estado "Test123" en StatusesEditor | ✅ Aparece en dropdowns |
| Asignar "Test123" a un lead de `company_valuations` | ✅ **Guarda sin error** |
| Asignar "compras" a un lead de `contact_leads` | ✅ **Guarda sin error** |
| Refrescar página | ✅ Estados persisten |
| Cambios masivos con nuevo estado | ✅ Funcionan |
| Estadísticas y filtros | ✅ Siguen funcionando |

---

## Ventajas de Esta Solución

1. **100% Dinámica**: Cualquier estado nuevo en `contact_statuses` funcionará automáticamente
2. **Sin pérdida de datos**: La migración copia todos los valores existentes
3. **Sin cambios en frontend**: El código actual ya soporta TEXT
4. **Reversible**: Si algo falla, se puede restaurar desde backup
5. **Consistente**: Las 7 tablas de leads usarán TEXT uniformemente

---

## Alternativa Considerada (Descartada)

**Añadir valor al ENUM**: 
```sql
ALTER TYPE lead_status ADD VALUE 'compras';
```

**Por qué NO**:
- Requiere hacerlo para cada nuevo estado
- No escala para estados dinámicos
- El usuario quiere crear estados sin tocar código

---

## Consideraciones de Seguridad

- RLS existente sigue funcionando (las políticas se basan en `id`, no en el tipo de columna)
- La validación en frontend previene valores inválidos
- Los valores existentes se preservan exactamente
