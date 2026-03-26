

## Plan: Simplificar tarjeta del Pipeline

Cambios en `src/features/leads-pipeline/components/PipelineCard.tsx`:

### 1. Eliminar badges de la sección "Company Profile" (líneas 183-203)
- Quitar el badge de **sector/industria** (`lead.industry`)
- Quitar el badge de **valoración** (el verde con `💰`)
- Mantener los badges de formulario (`leadFormName`) y canal (`channelName`)

### 2. Eliminar fila de empleados (líneas 220-225)
- Quitar el bloque que muestra `lead.employee_range` con icono `Users`

### 3. Cambiar formato financiero a una línea compacta
- Reemplazar la grid actual de facturación/EBITDA por una sola línea:
  `Fact: 500K  EBITDA: 70K`
- Usar el formateador existente `formatCurrency` pero sin el símbolo `€` para mayor compacidad, o dejarlo con `€`
- Solo mostrar esta línea si hay al menos uno de los dos valores

### Archivos afectados
| Archivo | Cambio |
|---------|--------|
| `PipelineCard.tsx` | Eliminar badges sector/valoración, eliminar empleados, reformatear financieros |

