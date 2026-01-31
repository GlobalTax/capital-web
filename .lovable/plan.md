
# Plan: Activar "Etapa Prospecto" en Estados Específicos

## Objetivo
Configurar los estados **"Reunión Programada"** y **"PSH Enviada"** como etapas de prospecto para poblar automáticamente el módulo `/admin/prospectos`.

## Estados Identificados

| Label | status_key | ID | is_prospect_stage actual |
|-------|------------|-----|-------------------------|
| Reunión Programada | fase0_activo | 7e2451a3-cc2b-408e-8e40-f1e1d5d7a522 | ❌ false |
| PSH Enviada | archivado | 8810d180-4cd8-4ae2-8aa5-12274004e974 | ❌ false |

## Solución

### Opción A: Actualización Manual via UI
1. Navegar a `/admin/contacts`
2. Hacer clic en el **icono de engranaje (⚙️)** en la barra de herramientas
3. En el modal de "Gestionar Estados":
   - Localizar **"Reunión Programada"**
   - Activar el toggle **"Etapa Prospecto"**
   - Localizar **"PSH Enviada"**
   - Activar el toggle **"Etapa Prospecto"**
4. Guardar cambios

### Opción B: Actualización Directa en Supabase
Ejecutar en el SQL Editor de Supabase:

```sql
UPDATE contact_statuses 
SET is_prospect_stage = true 
WHERE id IN (
  '7e2451a3-cc2b-408e-8e40-f1e1d5d7a522',  -- Reunión Programada
  '8810d180-4cd8-4ae2-8aa5-12274004e974'   -- PSH Enviada
);
```

## Resultado Esperado

Tras la actualización:
- El módulo `/admin/prospectos` mostrará automáticamente todos los leads/valoraciones que:
  - Tengan `lead_status_crm` = 'fase0_activo' (Reunión Programada) o 'archivado' (PSH Enviada)
  - Tengan un `empresa_id` vinculado

## Verificación

Ejecutar esta consulta para confirmar la configuración:

```sql
SELECT status_key, label, is_prospect_stage 
FROM contact_statuses 
WHERE is_prospect_stage = true;
```

---

## Sección Técnica

### Arquitectura del Flujo

El hook `useProspects` filtra contactos de la siguiente manera:
1. Obtiene todos los `status_key` donde `is_prospect_stage = true`
2. Consulta `contact_leads` + `company_valuations` con esos estados
3. Filtra solo registros con `empresa_id IS NOT NULL`
4. Enriquece con datos de la tabla `empresas`

### Nota sobre status_key vs label

Existe una **desalineación** entre los `status_key` internos y los labels visibles:
- `fase0_activo` → "Reunión Programada"
- `archivado` → "PSH Enviada"

Esto es funcional pero puede causar confusión en el código. Considerar estandarizar en el futuro.
