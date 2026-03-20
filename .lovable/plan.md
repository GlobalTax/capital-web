

## Permitir subida de PDF y PowerPoint en Campañas de Valoración

Actualmente, tres componentes dentro de campañas solo aceptan PDF. Se ampliarán para aceptar también PowerPoint (.ppt, .pptx).

### Cambios

**1. `DocumentStep.tsx`** (línea 137)
- Ampliar `accept` del dropzone para incluir PPTX/PPT además de PDF
- Actualizar textos de UI ("Documento PDF" → "Documento PDF / PowerPoint", mensajes de ayuda)

**2. `PresentationsStep.tsx`** (líneas 47-57)
- Ampliar `accept` del dropzone para incluir PPTX/PPT
- Actualizar el toast de rechazo y textos de UI

**3. `ProcessSendStep.tsx`** (líneas 462-468)
- Ampliar `accept` del input file para incluir PPTX/PPT
- Actualizar texto descriptivo

### Detalle técnico

Los MIME types a añadir en cada punto:
```
'application/vnd.ms-powerpoint': ['.ppt']
'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
```

No hay cambios de backend necesarios — Supabase Storage acepta cualquier tipo de archivo.

