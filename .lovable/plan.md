

## Smart Planner Simplificado: Solo Temas, la IA Decide Todo

### Objetivo

Eliminar todos los campos de configuracion (fecha inicio, frecuencia, canales preferidos) del Smart Planner. El usuario solo pega sus temas y pulsa un boton. La IA decide automaticamente las fechas optimas, frecuencia, canales y todo lo demas.

---

### Cambios

**1. Simplificar `SmartPlannerSection.tsx`**

- Eliminar los estados `startDate`, `frequency`, `preferredChannels` y todos sus controles (date picker, selects)
- Dejar solo el textarea y el boton "Generar Plan"
- En la llamada a la Edge Function, enviar solo `topics` y `start_date: hoy` sin frecuencia ni canales preferidos
- Resultado: interfaz ultra-limpia con solo 2 elementos: textarea + boton

**2. Actualizar Edge Function `generate-content-calendar-ai`**

- En el modo `smart_plan`, hacer que la frecuencia y canales sean decididos por la IA, no parametros del usuario
- Actualizar el system prompt para que la IA:
  - Calcule la frecuencia optima segun el numero de temas (pocos temas = mas espaciados, muchos = mas frecuentes)
  - Decida la fecha de inicio a partir de manana
  - Distribuya automaticamente entre canales segun el tipo de contenido
  - No dependa de ningun parametro de configuracion del usuario

---

### Resultado final

El flujo sera:
1. Pegas temas (uno por linea)
2. Pulsas "Generar Plan"
3. La IA devuelve la tabla completa con todo decidido
4. Revisas, editas si quieres, y cargas al calendario

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/admin/content-calendar/SmartPlannerSection.tsx` | Eliminar controles de fecha/frecuencia/canales, simplificar UI |
| `supabase/functions/generate-content-calendar-ai/index.ts` | Hacer frecuencia y canales autonomos en modo smart_plan |

