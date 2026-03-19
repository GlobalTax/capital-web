

## Limpiar modal ROD: eliminar pestaña "Plantilla"

### Resumen

Eliminar la pestaña "Plantilla" (el editor visual de slides `SlideTemplateEditor`) del modal de generación ROD. Se mantienen solo dos pestañas: **Configuración** y **Slides fijas** (subida de PPTX + imágenes).

### Cambios

**`GenerateDealhubModal.tsx`**
- Eliminar import de `SlideTemplateEditor`
- Eliminar la `TabsTrigger` de "Plantilla" y su `TabsContent`
- Eliminar la función `mergeWithDefaults` (ya no se necesita mezclar defaults del editor visual)
- Simplificar el `useEffect` de carga: usar el template tal cual viene de `loadDefault()`
- Ajustar la lógica de `isWideTab`: solo aplica cuando `activeTab === 'static'`

**`SlideTemplateEditor.tsx`**
- Eliminar el archivo completo (ya no se usa)

### Resultado

El modal queda con 2 pestañas:
1. **Configuración** — trimestre, secciones, operaciones
2. **Slides fijas** — subir PPTX plantilla (con mapeo) o imágenes individuales

