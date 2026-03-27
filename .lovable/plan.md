

## Plan: Eliminar emojis de las columnas del pipeline de leads

### Cambio

**Archivo: `src/features/leads-pipeline/components/PipelineColumn.tsx`** (línea 68)
- Eliminar la línea `{column.icon && <span className="text-lg">{column.icon}</span>}` que renderiza el emoji en el header de cada columna.

**Archivo: `src/features/leads-pipeline/components/PipelineColumnsEditor.tsx`** (línea 140)
- Eliminar la línea `{column.icon && <span className="text-lg shrink-0">{column.icon}</span>}` del editor de columnas para consistencia.

Esto elimina los emojis visualmente sin borrar los datos del campo `icon` en la base de datos, por si se quisieran restaurar en el futuro.

