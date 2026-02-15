

## Sistema "Agendar con IA" -- Auto-programar contenidos existentes

### Objetivo
Crear un boton "Agendar con IA" que tome los contenidos existentes sin fecha (ideas, borradores) y les asigne fechas inteligentes automaticamente, rellenando el calendario. El resultado es editable antes de confirmar.

---

### Flujo de usuario

1. El usuario pulsa "Agendar con IA" (visible en Kanban, Calendario o Lista)
2. Se abre un dialogo que muestra cuantos items sin fecha hay y permite configurar:
   - Fecha de inicio (por defecto: manana)
   - Horizonte temporal: 2 semanas / 1 mes / 2 meses
   - Que estados incluir: ideas, drafts, review (checkboxes)
3. Al pulsar "Generar calendario", la IA recibe todos esos items y devuelve un plan con fechas asignadas
4. Se muestra una tabla de preview con las fechas propuestas (igual que SmartPlanner: editable inline)
5. El usuario puede modificar fechas, deseleccionar items, y al confirmar se actualizan todos en la BD

### Cambios

**1. Nuevo componente `AutoScheduleDialog.tsx`**
- Dialogo modal con configuracion (fecha inicio, horizonte, filtro de estados)
- Vista previa de items a programar
- Tabla de resultados editable (reutilizando patron de SmartPlannerSection)
- Boton de confirmacion que hace batch update via `updateItem.mutate`

**2. Nuevo modo en la Edge Function `generate-content-calendar-ai`**
- Modo `auto_schedule`: recibe los items existentes (titulo, canal, tipo, prioridad, notas) y un rango de fechas
- Nuevo system prompt `SYSTEM_PROMPT_AUTO_SCHEDULE` que instruye a la IA a:
  - Respetar las reglas de frecuencia por canal (max 3 LinkedIn empresa/semana, etc.)
  - No programar 2 contenidos del mismo canal en el mismo dia
  - Priorizar items con prioridad alta/urgente antes en el calendario
  - Alternar canales y formatos para variedad
  - Devolver un mapping `{ item_id: scheduled_date }` para cada item
- Tool calling para respuesta estructurada

**3. Integrar el boton en `ContentCalendarManager.tsx`**
- Boton "Agendar con IA" junto al buscador o en el header
- Visible solo cuando hay items sin fecha programada
- Badge con el numero de items pendientes de agendar

---

### Detalles tecnicos

| Archivo | Cambio |
|---|---|
| `src/components/admin/content-calendar/AutoScheduleDialog.tsx` | Nuevo componente: dialogo con config, preview y tabla editable |
| `supabase/functions/generate-content-calendar-ai/index.ts` | Nuevo modo `auto_schedule` con prompt y tool calling |
| `src/components/admin/content-calendar/ContentCalendarManager.tsx` | Boton "Agendar con IA" en el header |

### Logica de la IA para programar

La IA recibe:
- Lista de items con su id, titulo, canal, tipo, prioridad, notas
- Fecha de inicio y fecha de fin del horizonte
- Items ya programados en ese rango (para no solapar)

Y devuelve para cada item una fecha optima siguiendo las reglas editoriales (frecuencia por canal, prioridad, variedad).
