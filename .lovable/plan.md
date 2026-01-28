

# Plan: Cambiar Frecuencia de Alertas a 2 Veces al Día

## Cambio Requerido

Modificar el cron job `check-calculator-errors-job` de cada 5 minutos a **2 veces al día**.

## Horarios Propuestos

| Ejecución | Hora | Cron Expression |
|-----------|------|-----------------|
| Mañana | 09:00 | `0 9 * * *` |
| Tarde | 18:00 | `0 18 * * *` |

**Expresión combinada:** `0 9,18 * * *` (a las 9:00 y 18:00 cada día)

Estos horarios coinciden con inicio y fin de jornada laboral, cuando el equipo puede revisar y actuar sobre errores detectados.

---

## Implementación

### Migración SQL

Se ejecutará una migración para:

1. **Eliminar** el cron job actual (cada 5 minutos)
2. **Crear** el nuevo cron job (2 veces al día)

```sql
-- Eliminar el cron job actual
SELECT cron.unschedule('check-calculator-errors-job');

-- Crear nuevo cron job: 2 veces al día (9:00 y 18:00)
SELECT cron.schedule(
  'check-calculator-errors-job',
  '0 9,18 * * *',
  $$
  SELECT net.http_post(
    url:='https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/check-calculator-errors',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ...'
    ),
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);
```

---

## Ajuste de Ventana de Tiempo en Edge Function

Dado que ahora se ejecuta 2 veces al día (cada ~12 horas), la Edge Function debería buscar errores en las **últimas 12 horas** en lugar de los últimos 5 minutos.

**Archivo:** `supabase/functions/check-calculator-errors/index.ts`

**Cambio:**
```typescript
// ANTES: 5 minutos
const TIME_WINDOW_MINUTES = 5;

// DESPUÉS: 12 horas (720 minutos)
const TIME_WINDOW_MINUTES = 720;
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | Reprogramar cron job |
| `supabase/functions/check-calculator-errors/index.ts` | Cambiar ventana de tiempo a 12 horas |

---

## Impacto

- **Reducción de carga:** De 288 ejecuciones/día a solo 2
- **Alertas consolidadas:** Resumen de errores de medio día en lugar de alertas inmediatas
- **Mismo umbral:** Se mantiene el umbral de 3+ errores para enviar alerta

