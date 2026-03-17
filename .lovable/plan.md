

## Plan: Resaltar filas de empresas consolidadoras

### Cambio único en `ContactListDetailPage.tsx` (línea ~1820-1823)

Añadir una clase condicional al `TableRow` que compruebe si `(company as any).consolidador` es `true`. En ese caso, aplicar un fondo distintivo (por ejemplo, `bg-emerald-50 dark:bg-emerald-950/30 border-l-2 border-l-emerald-500`).

La lógica de prioridad será:
1. Si es consolidador → fondo verde claro con borde izquierdo verde
2. Si está asignada a sublista (y no consolidador) → mantiene el estilo actual amarillo
3. Sin marcar → sin estilo especial

Esto es un cambio de una sola línea en el `cn()` del `TableRow`.

