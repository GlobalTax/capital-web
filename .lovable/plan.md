

## Planificador Inteligente de Contenidos: Temas a Plan Editorial

### Resumen

Crear un nuevo componente "Smart Planner" dentro del IA Engine donde puedas pegar una lista de temas (en texto libre, uno por linea) y la IA devuelva un plan editorial completo: fecha de publicacion optima, canal recomendado, formato, audiencia, prioridad y un brief de contenido para cada tema. Todo se puede revisar y cargar al calendario con un clic.

---

### Flujo de usuario

1. Abres la pestana "IA Engine"
2. Ves una nueva seccion "Smart Planner" con un textarea grande
3. Pegas tu lista de temas (ej: "consolidacion dental en Espana", "que busca un fondo en tu empresa", "caso de exito asesoria fiscal")
4. Opcionalmente configuras: fecha de inicio del plan, frecuencia deseada (2-3 posts/semana), canales preferidos
5. Pulsas "Generar Plan Editorial"
6. La IA devuelve una tabla/lista con cada tema expandido: titulo optimizado, fecha sugerida, canal, formato, audiencia, prioridad, brief, keywords SEO
7. Puedes editar cualquier campo inline antes de confirmar
8. Boton "Cargar todo al calendario" inserta todos los items

---

### Cambios tecnicos

**1. Actualizar Edge Function `generate-content-calendar-ai`**

Anadir un nuevo modo `smart_plan` que recibe:
- `topics`: array de strings (los temas del usuario)
- `start_date`: fecha de inicio del plan
- `frequency`: posts por semana deseados
- `preferred_channels`: canales preferidos (o "all")

El prompt del sistema instruira a la IA para:
- Asignar fechas optimas considerando la frecuencia y alternando canales
- Elegir el canal mas adecuado para cada tema (ej: dato impactante = LinkedIn empresa, reflexion personal = LinkedIn personal, guia larga = blog)
- Generar titulo optimizado, brief de 2-3 lineas, dato clave, keywords, formato y audiencia
- Distribuir prioridades logicamente (temas temporales = urgente, evergreen = medio)
- Alternar entre cuenta empresa y personal en LinkedIn
- Devolver el plan via tool calling como JSON estructurado

**2. Nuevo componente `SmartPlannerSection.tsx`**

Seccion dentro de AIContentEngine con:
- Textarea para pegar temas (uno por linea)
- Configuracion: fecha inicio (date picker), frecuencia (select: 2/semana, 3/semana, diario), canales preferidos (multi-select)
- Boton "Generar Plan Editorial con IA"
- Tabla de resultados editable con columnas: Titulo, Fecha, Canal, Formato, Prioridad, Audiencia, Brief
- Cada fila permite editar fecha y canal antes de confirmar
- Boton "Cargar todo al calendario" y "Cargar seleccionados"

**3. Integrar en AIContentEngine.tsx**

Anadir SmartPlannerSection como tercera seccion principal junto a "Cargar Plan Inicial" y "Generar Ideas con IA".

---

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `supabase/functions/generate-content-calendar-ai/index.ts` | Anadir modo `smart_plan` con prompt especializado y tool calling |
| `src/components/admin/content-calendar/SmartPlannerSection.tsx` | NUEVO componente con textarea + tabla de resultados |
| `src/components/admin/content-calendar/AIContentEngine.tsx` | Integrar SmartPlannerSection |

---

### Detalle del prompt IA para Smart Planner

El system prompt codificara reglas de planificacion editorial:
- LinkedIn empresa: maximo 3 posts/semana, mejores dias martes-jueves 8:00-10:00
- LinkedIn personal: 2-3 posts/semana, mejores dias lunes/miercoles/viernes
- Blog: 1-2 articulos/mes, publicar martes o miercoles
- Newsletter: quincenal o mensual, enviar martes o jueves
- Alternar formatos (carrusel, texto largo, dato destacado) para variedad
- No programar mas de 1 contenido por canal por dia
- Priorizar temas temporales/urgentes antes en el calendario

