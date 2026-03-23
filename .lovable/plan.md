

## Hacer clic en la tarjeta del pipeline para abrir el perfil

### Problema
Actualmente solo se puede acceder al perfil desde el menú de 3 puntos → "Ver detalle". La tarjeta tiene `cursor-pointer` pero no tiene `onClick`.

### Cambio

**Archivo: `src/features/leads-pipeline/components/PipelineCard.tsx`**

Añadir `onClick={onViewDetails}` al componente `<Card>` (línea 89). La navegación ya está implementada en `handleViewDetails` del padre, que redirige a `/admin/contacts/:id` o `/admin/valuations/:id` según el origen.

Un solo atributo en un solo archivo.

