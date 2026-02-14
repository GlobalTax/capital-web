

## Smart Planner: De Ideas Amplias a Plan Editorial Completo

### Problema actual

El Smart Planner espera temas concretos (uno por linea), pero tu quieres poder escribir ideas amplias como *"Vamos a disenar una campana de articulos sobre consolidacion en el sector de la Certificacion"* y que la IA descomponga esa idea en multiples piezas de contenido organizadas.

### Solucion

Cambiar el Smart Planner para que acepte **ideas libres** (una o varias) en lugar de temas individuales. La IA recibe esas ideas y genera ella misma los temas concretos, titulos, fechas, canales y todo lo demas.

---

### Cambios

**1. Actualizar UI (`SmartPlannerSection.tsx`)**

- Cambiar el placeholder del textarea para reflejar que acepta ideas amplias, no solo temas sueltos
- Cambiar el label y textos de ayuda: "Describe tus ideas" en vez de "Escribe un tema por linea"
- Enviar el texto completo como un unico string (`idea`) en vez de un array de topics linea por linea
- Actualizar el contador para mostrar "idea(s)" en vez de "tema(s)"

**2. Actualizar Edge Function (`generate-content-calendar-ai`)**

- Actualizar `SYSTEM_PROMPT_SMART_PLAN` para instruir a la IA a:
  - Interpretar ideas amplias y conceptuales (ej: "campana sobre consolidacion dental")
  - Descomponer cada idea en 5-10 piezas de contenido concretas
  - Crear una narrativa coherente entre las piezas (secuencia logica)
  - Decidir cuantos contenidos generar segun la amplitud de la idea
- Cambiar el parametro de entrada: aceptar `idea` (string libre) ademas de `topics` (retrocompatible)
- Actualizar el user prompt para pasar el texto tal cual lo escribe el usuario

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/admin/content-calendar/SmartPlannerSection.tsx` | Adaptar textarea, placeholder, envio de datos como idea libre |
| `supabase/functions/generate-content-calendar-ai/index.ts` | Actualizar prompt y parametros para aceptar ideas amplias |

