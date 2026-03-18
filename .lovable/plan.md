

## Plan: Añadir KPI de Tasa de Contestación

### Cambio

En **`OutboundSummaryDashboard.tsx`**:

1. **Nuevo KPI "Contestados"** en la fila de tarjetas superiores (después de Tasa Apertura): suma de `interesados + reuniones + noInteresados` — es decir, todos los que han respondido de alguna forma. Mostrar también la tasa como `% de enviados`.

2. **Actualizar el funnel** para que cada tarjeta (Interesados, Reuniones, No interesados) muestre además su porcentaje sobre el total de contestados, no solo sobre enviados. Así se ve tanto "% de enviados" como "% de contestados".

3. **Añadir columna "Contestados" en la tabla** de desglose por campaña, entre "Tasa" e "Interesados", con el total de respuestas por campaña.

### Archivo afectado
| Archivo | Cambio |
|---------|--------|
| `OutboundSummaryDashboard.tsx` | ~20 líneas: nuevo KPI card, columna en tabla, porcentajes adicionales en funnel |

