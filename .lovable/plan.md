

## Plan: Cron L-S + Secciones Mensual y Global

### Cambios

**1. Cron job: Lunes a Sábado**
Actualizar el cron schedule de `'0 9 * * *'` (todos los días) a `'0 9 * * 1-6'` (lunes a sábado). Requiere ejecutar SQL para eliminar el job actual y crear uno nuevo.

**2. Nuevas secciones en el email: Mensual + Global**
En `send-outbound-report/index.ts`:
- Añadir `getMonthRange()` — del día 1 del mes actual hasta ahora
- Añadir rango "Global" — sin filtro de fecha (usar todo el histórico)
- Calcular KPIs para ambos períodos con `calcKPIs()`
- Renderizar 4 secciones en el email: Ayer → Semana → Mes → Global

### Archivos

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-outbound-report/index.ts` | +`getMonthRange()`, rango global, 2 secciones extra en HTML |
| SQL (cron job) | Reemplazar schedule a `'0 9 * * 1-6'` |

