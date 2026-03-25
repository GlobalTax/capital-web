

## Mostrar leads con etiqueta "compras" en la columna "Nuevo"

### Problema
Los leads en `acquisition_leads` tienen `lead_status_crm = 'compras'` (8 registros). Este valor no es un estado válido del pipeline (no existe como columna), así que no aparecen en ninguna columna del Kanban.

### Solución
Modificar `useBuyPipeline.ts` para mapear `lead_status_crm = 'compras'` a `'nuevo'` durante la normalización de datos. Así estos leads aparecerán automáticamente en la columna "Nuevo" del Pipeline Compras.

### Cambios

**1. `src/features/leads-pipeline/hooks/useBuyPipeline.ts`**
- Eliminar el filtro `.not('lead_status_crm', 'is', null)` de la query de `acquisition_leads` (o mantenerlo y añadir `'compras'` como valor aceptado)
- En el mapeo de `acquisitionLeads`, normalizar: si `lead_status_crm` es `'compras'` o `null`, asignar `'nuevo'`

Lógica:
```typescript
lead_status_crm: (a.lead_status_crm === 'compras' || !a.lead_status_crm) 
  ? 'nuevo' 
  : a.lead_status_crm
```

Esto hará que los 8 leads con etiqueta "compras" + cualquier lead sin estado aparezcan en la columna "Nuevo".

### Archivos afectados
- `src/features/leads-pipeline/hooks/useBuyPipeline.ts` (1 archivo)

