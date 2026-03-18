

## Plan: Corregir columna Estado en el PDF semanal

### Problema
jsPDF usa la fuente Helvetica que **no soporta emojis ni caracteres Unicode extendidos** (✅, 📅, ❌, 📞, etc.). Por eso el PDF muestra caracteres corruptos como "Ø=ÜÀ" antes del texto.

### Solución
Eliminar todos los emojis de las etiquetas de estado, tipo e interacción en `send-weekly-outbound-pdf/index.ts` y usar texto plano. Opcionalmente, colorear las celdas de estado para mantener la diferenciación visual.

### Cambios en `supabase/functions/send-weekly-outbound-pdf/index.ts`

1. **Líneas 372-378** — `estadoLabels`: Quitar emojis
   - `'✅ Interesado'` → `'Interesado'`
   - `'📅 Reunión'` → `'Reunión'`
   - `'❌ No interesado'` → `'No interesado'`
   - `'📞 Contactado'` → `'Contactado'`
   - `'🤝 En negociación'` → `'En negociación'`

2. **Líneas 426-432** — `tipoLabels`: Quitar emojis
   - `'📧 Email'` → `'Email'`, `'📞 Llamada'` → `'Llamada'`, etc.

3. **Líneas 435-440** — `resultLabels`: Quitar emojis
   - `'✅ Positivo'` → `'Positivo'`, `'❌ Negativo'` → `'Negativo'`, etc.

4. **Añadir colores por estado** en la tabla de "Empresas con Respuesta" usando `didParseCell`:
   - Interesado → azul
   - Reunión → verde
   - No interesado → rojo
   - Otros → gris

5. **Redesplegar** la Edge Function.

