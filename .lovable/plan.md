

## Subir PPTX como plantilla base y mergear con slides automáticas

### Estado: ✅ Implementado

### Concepto

El usuario sube un archivo PPTX completo con sus slides estáticas (portada, índice, separadores, cierre). Al generar el catálogo ROD, las slides de operaciones auto-generadas se insertan en las posiciones correctas dentro del PPTX plantilla mediante una edge function que usa JSZip para mergear los XMLs internos.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/merge-pptx/index.ts` | Edge function que usa JSZip para mergear dos PPTX + soporte `skipSlides` |
| `StaticSlidesUploader.tsx` | Uploader para .pptx completo + editor de mapeo de slides |
| `slideTemplate.ts` | Campos `templatePptxUrl`, `templateSlideMap`, `skipSlides` en `FullSlideTemplate` |
| `generateDealhubPptx.ts` | Flujo condicional: merge con plantilla usando `templateSlideMap` |
| `GenerateDealhubModal.tsx` | No aplica `mergeWithDefaults` cuando hay PPTX plantilla |
| `supabase/config.toml` | Configuración de la edge function |

### Mapeo por defecto (basado en plantilla real)

- Slide 3: Separador Mandatos de Venta
- Slide 4: Operación ejemplo → **se elimina** (`skipSlides: [4]`)
- Slide 5: Separador Fase de Preparación
- Slide 6: Separador Mandatos de Compra
- Slide 7: Separador En Exclusividad
- Slide 8: Cierre (se mantiene)

### Flujo simplificado

1. Subir PPTX → se aplica mapeo por defecto
2. Ajustar mapeo si es necesario (campos numéricos editables)
3. Indicar slides a eliminar (ej: slide 4 de ejemplo)
4. Al generar: sólo se crean slides de operaciones + merge automático
