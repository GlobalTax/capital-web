

## Plan: Añadir campo editable de descargas/visitas en el formulario

### Cambio
Añadir un campo numérico "Número de descargas" en `LeadMagnetFormDialog.tsx` (visible solo en modo edición) que permita modificar manualmente el `download_count`. También añadir campo para `lead_conversion_count`.

### Archivo: `src/components/admin/lead-magnets/LeadMagnetFormDialog.tsx`
- Añadir estados `downloadCount` y `conversionCount`
- Cargarlos desde `editingMagnet` en el `useEffect`
- Mostrar dos inputs numéricos (solo en modo edición, entre Status y PDF upload)
- Incluirlos en el payload de `updateLeadMagnet`

### Archivo: `src/hooks/useLeadMagnets.tsx`
- Verificar que `updateLeadMagnet` ya acepta `download_count` y `lead_conversion_count` en el payload (sí, acepta `Partial<LeadMagnet>` — no requiere cambios)

### Resultado
Al editar un recurso existente, aparecerán campos para modificar manualmente las descargas y conversiones.

