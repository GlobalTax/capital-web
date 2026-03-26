

## Plan: Colores de badges por origen y eliminar emojis

### 1. Colores de badges en `PipelineCard.tsx` (y `BuyPipelineCard`)

Reemplazar los colores genéricos de los badges `leadFormName` y `channelName` por colores dinámicos según el valor:

| Badge value (contiene) | Color |
|---|---|
| "valoración" / "valuation" | Azul (`bg-blue-100 text-blue-700`) |
| "venta" / "sell" | Verde (`bg-green-100 text-green-700`) |
| "google" | Rojo (`bg-red-100 text-red-700`) |
| "meta" / "facebook" / "instagram" | Azul oscuro (`bg-indigo-100 text-indigo-700`) |
| Otros formularios | Gris (`bg-gray-100 text-gray-700`) |
| Otros canales | Púrpura (actual) |

- Eliminar los emojis 📋 y 📡 de los badges
- Crear una función helper `getBadgeColor(name, type)` para mapear nombre → clases de color

### 2. Eliminar emojis de columnas del pipeline

En `PIPELINE_COLUMNS` (types/index.ts), quitar los emojis del campo `icon` (dejarlo vacío `''`).

En `PipelineColumn.tsx` y `PipelineColumnsEditor.tsx`, no renderizar `<span>` del icono si está vacío.

### 3. Eliminar emojis del dropdown de acciones

En `PipelineCard.tsx` línea 169: quitar el `✓` emoji del texto "Email pre-llamada enviado".

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `PipelineCard.tsx` | Colores dinámicos en badges, quitar emojis |
| `BuyPipelineView.tsx` | Mismos cambios en BuyPipelineCard |
| `types/index.ts` | Vaciar campo `icon` en PIPELINE_COLUMNS |
| `PipelineColumn.tsx` | No renderizar icono vacío |
| `PipelineColumnsEditor.tsx` | No renderizar icono vacío |

