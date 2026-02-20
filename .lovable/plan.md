
# Arreglar constraint de responsable en Checklist Sell-Side

## Diagnóstico exacto (confirmado)

El error real NO es el `fase_check`. El error es el **`mandato_checklist_tasks_responsable_check`**. Aunque el mensaje de Postgres lo cita como `fase_check`, el problema está en el campo `responsable`.

### Evidencia confirmada en la base de datos

**Constraint actual** (`mandato_checklist_tasks_responsable_check`):
```
CHECK (responsable = ANY (ARRAY[
  'Dirección M&A', 'Analista', 'Asesor M&A', 'Marketing', 'Legal',
  'Research', 'M&A Support', 'Partner', 'Analista Senior'
]))
```

**Template de venta (sell-side)**: tiene **16 tareas** con `responsable = 'Equipo M&A'`, todas en las fases `4. Due Diligence` y `5. Cierre`.

**Resultado**: cuando `copy_checklist_template_by_type(mandato_id, 'venta')` intenta INSERT estas 16 tareas, el constraint las rechaza.

**Por qué Buy-Side funciona**: el template de `compra` no tiene ningún `'Equipo M&A'` — solo usa `'Dirección M&A'`, `'Research'`, `'Analista'`, `'M&A Support'`, `'Legal'` (todos permitidos).

### Tareas afectadas (16 en total)

- 8 tareas en `4. Due Diligence`: Coordinar kick-off DD, Facilitar acceso Data Room, Responder Q&A, Coordinar management presentations, Gestionar solicitudes, Monitorizar avance DD, Revisar hallazgos, Informe resumen DD
- 8 tareas en `5. Cierre`: Analizar ofertas vinculantes, Negociar SPA, Definir ajustes precio, Coordinar asesores legales, Gestionar condiciones suspensivas, Preparar closing checklist, Firma SPA, Closing y transferencia

## Solución: Migración SQL para ampliar el constraint

**Opción elegida**: ampliar el constraint para incluir `'Equipo M&A'`. Es el valor semánticamente correcto (múltiples roles trabajan en DD y Cierre) y fue incluido intencionadamente en el template.

### Migración SQL

```sql
-- 1. Backup de seguridad (no necesario en Live si solo hay datos de test)
-- El checklist de este mandato está vacío (confirmado en DB)

-- 2. Eliminar constraint antiguo
ALTER TABLE mandato_checklist_tasks
DROP CONSTRAINT IF EXISTS mandato_checklist_tasks_responsable_check;

-- 3. Crear constraint actualizado incluyendo 'Equipo M&A'
ALTER TABLE mandato_checklist_tasks
ADD CONSTRAINT mandato_checklist_tasks_responsable_check
CHECK (
  responsable IS NULL OR
  responsable = ANY (ARRAY[
    'Dirección M&A',
    'Analista',
    'Asesor M&A',
    'Marketing',
    'Legal',
    'Research',
    'M&A Support',
    'Partner',
    'Analista Senior',
    'Equipo M&A'   -- NUEVO: añadido para permitir las tareas de DD y Cierre sell-side
  ])
);
```

**Nota importante**: el constraint original NO tenía `IS NULL`, lo que significa que si `responsable` es NULL la fila habría fallado de todas formas. Se añade `IS NULL OR` por robustez, dado que la columna es nullable (`is_nullable: YES`).

## Archivos a crear/modificar

Solo **1 migración SQL**:

`supabase/migrations/TIMESTAMP_fix_responsable_constraint_sell_side.sql`

## Por qué no se toca código frontend

El sistema de checklist se llama íntegramente a través de la función RPC `copy_checklist_template_by_type(p_mandato_id, p_tipo_operacion)`. No existe código fuente de este feature en el repositorio (fue implementado en el entorno live sin hacer commit al repo, o fue eliminado). El fix está 100% en la base de datos.

## Lo que NO cambia

- Función RPC `copy_checklist_template_by_type`: no necesita cambios
- Función RPC `copy_checklist_template_to_mandato`: no necesita cambios
- Templates de `compra` (buy-side): no afectados (sus values ya estaban en el constraint)
- Cualquier tarea existente en `mandato_checklist_tasks`: el nuevo constraint es más permisivo, así que las filas existentes siguen siendo válidas
- El constraint `fase_check` y `estado_check`: no se tocan

## Verificación post-migración

Después de aplicar la migración, el botón "Ver y copiar plantilla" en el mandato sell-side `5beb72d8-b73e-4d8e-9773-1a44ac86bfc8` funcionará sin errores: la llamada a `copy_checklist_template_by_type('5beb72d8...', 'venta')` insertará las 48 tareas del template correctamente (incluyendo las 16 con `'Equipo M&A'`).
