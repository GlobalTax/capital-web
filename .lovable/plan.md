

## Subir PPTX como plantilla base y mergear con slides automáticas

### Concepto

El usuario sube un archivo PPTX completo con sus slides estáticas (portada, índice, separadores, cierre) ya diseñadas. Al generar el catálogo ROD, se toman esas slides del PPTX subido y se insertan las slides de operaciones auto-generadas en las posiciones correctas. Resultado: un único PPTX final que combina ambos.

### Enfoque técnico

Un PPTX es un archivo ZIP con XMLs dentro. Usaremos **JSZip** en una **edge function** para:

1. Abrir el PPTX plantilla subido por el usuario
2. Recibir las slides de operaciones generadas (como PPTX blob desde el cliente con pptxgenjs)
3. Extraer las slides de operaciones del PPTX generado
4. Insertarlas en las posiciones correctas dentro del PPTX plantilla
5. Devolver el PPTX combinado

### Flujo del usuario

1. En la pestaña "Slides fijas", nuevo botón **"Subir PPTX plantilla"** (además de las imágenes individuales)
2. El usuario sube su archivo .pptx al bucket `slide-backgrounds`
3. Al generar, el sistema detecta que hay un PPTX plantilla guardado
4. Genera solo las slides de operaciones con pptxgenjs
5. Llama a la edge function `merge-pptx` que combina ambos
6. Descarga el resultado final

### Estructura del PPTX plantilla

El usuario debe organizar su PPTX con marcadores de posición. Definimos una convención:
- Slides 1-2: Portada + Índice (se mantienen tal cual)
- Slides 3, 4, 5, 6: Separadores de sección (uno por cada sección habilitada)
- Última slide: Cierre
- Las slides de operaciones se insertan DESPUÉS de cada separador correspondiente

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/merge-pptx/index.ts` | Edge function que usa JSZip para mergear dos PPTX |
| `StaticSlidesUploader.tsx` | Añadir campo de upload para archivo .pptx completo |
| `slideTemplate.ts` | Añadir campo `templatePptxUrl?: string` al `FullSlideTemplate` |
| `generateDealhubPptx.ts` | Nueva función que genera solo slides de operaciones + llama a la edge function para merge |
| `GenerateDealhubModal.tsx` | Lógica condicional: si hay PPTX plantilla, usar flujo merge; si no, flujo actual |

### Edge Function: `merge-pptx`

```text
Input:
  - templateUrl: URL del PPTX plantilla en storage
  - operationsBlob: base64 del PPTX con solo operaciones
  - sectionInsertPoints: mapa de qué slides del template son separadores

Output:
  - PPTX combinado como blob

Proceso:
  1. Descargar template PPTX desde storage
  2. Parsear ambos PPTX con JSZip
  3. Extraer slides XML del PPTX de operaciones
  4. Insertar en el template después de cada separador
  5. Actualizar [Content_Types].xml y presentation.xml
  6. Devolver ZIP resultante
```

### Consideraciones

- Si el PPTX plantilla no está subido, el flujo actual (generación completa con pptxgenjs) sigue funcionando como fallback
- El merge XML es delicado con relationships y media; la edge function manejará la re-numeración de slides y rels
- Límite de archivo: 20MB para el PPTX plantilla

