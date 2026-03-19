

## Subir PPTX como plantilla base y mergear con slides automáticas

### Estado: ✅ Implementado

### Concepto

El usuario sube un archivo PPTX completo con sus slides estáticas (portada, índice, separadores, cierre). Al generar el catálogo ROD, las slides de operaciones auto-generadas se insertan en las posiciones correctas dentro del PPTX plantilla mediante una edge function que usa JSZip para mergear los XMLs internos.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/merge-pptx/index.ts` | Edge function que usa JSZip para mergear dos PPTX |
| `StaticSlidesUploader.tsx` | Uploader para .pptx completo + imágenes individuales |
| `slideTemplate.ts` | Campo `templatePptxUrl?: string` en `FullSlideTemplate` |
| `generateDealhubPptx.ts` | Flujo condicional: merge con plantilla o generación completa |
| `supabase/config.toml` | Configuración de la edge function |

### Convención de plantilla PPTX

- Slides 1-2: Portada + Índice
- Slides 3, 4, 5, 6: Separadores de sección
- Última slide: Cierre
- Las operaciones se insertan DESPUÉS de cada separador
