

## Botón masivo "Generar descripciones IA" para todas las empresas

### Cambio en `ContactListDetailPage.tsx`

**1. Nuevo estado**
- `bulkAiRunning: boolean` — indica si el proceso masivo está en marcha
- `bulkAiProgress: { done: number; total: number; errors: number }` — progreso

**2. Nueva función `handleBulkAiGenerate`**
- Filtra empresas que tienen `web` no vacío Y `descripcion_actividad` vacío (solo genera para las que faltan)
- Si no hay candidatas, toast info "Todas las empresas ya tienen descripción o no tienen web"
- Confirma con el usuario: "Se generará la descripción para X empresas. ¿Continuar?"
- Itera secuencialmente (para no saturar la edge function), llamando a `generate-company-description` con cada URL
- Tras cada respuesta exitosa, actualiza `descripcion_actividad` en DB
- Actualiza el progreso en tiempo real
- Al terminar, invalida la query y muestra toast resumen: "Generadas X descripciones. Y errores."

**3. Botón en la barra de herramientas** (junto a los filtros, línea ~903)
- Botón con icono `Sparkles` + texto "Generar descripciones IA"
- Disabled mientras `bulkAiRunning`
- Mientras ejecuta: muestra `Loader2` spinner + "Generando X/Y..."
- Solo visible cuando hay empresas en la lista

### Lógica clave

```text
candidatas = empresas con web && sin descripcion_actividad
for each candidata:
  → invoke generate-company-description({ url })
  → update outbound_list_companies.descripcion_actividad
  → actualizar progreso
invalidar query
toast resumen
```

### Fichero editado
- `src/pages/admin/ContactListDetailPage.tsx` — añadir estado, función y botón

No se crean ficheros nuevos ni se modifica la edge function existente.

