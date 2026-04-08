

## Plan: Filtrar empresas sin envío inicial en Follow Up

### Problema
La lista de Follow Up muestra todas las empresas de la campaña, incluyendo aquellas que aún no han recibido el email inicial. Esto puede provocar que se envíe un follow-up a una empresa que nunca recibió el primer correo.

### Cambio
Añadir una condición al filtro `visible` en `FollowUpStep.tsx` (línea 502) para excluir empresas que no tengan registro de envío inicial en `emailSentMap`.

### Implementación (1 archivo)

**`src/components/admin/campanas-valoracion/steps/FollowUpStep.tsx`**

1. En el filtro `visible` (~línea 502), añadir como primera condición que la empresa tenga un `sent_at` en `emailSentMap` (es decir, que el email inicial haya sido enviado).
2. Aplicar el mismo filtro en el cálculo de `eligible` del `TemplateEditor` (~línea 88), para que el contador de "empresas pendientes" y "excluidas" refleje solo las que realmente recibieron el primer mail.
3. Actualizar el mensaje informativo de "Se enviará este follow up a X empresa(s) pendiente(s)" para que tenga en cuenta las empresas sin envío inicial, mostrando algo como "Se han excluido Y empresa(s) sin envío inicial".

### Lógica clave
```typescript
// Línea 502 – añadir check de envío inicial
const visible = companies.filter(c => {
  // Solo mostrar empresas que ya recibieron el email inicial
  if (!emailSentMap.get(c.id)) return false;
  if (respondedInPreviousRounds.has(c.id)) return false;
  const globalOk = (c.seguimiento_estado || 'sin_respuesta') === 'sin_respuesta';
  const hasRoundRecord = sendMap.has(c.id);
  return globalOk || hasRoundRecord;
});
```

