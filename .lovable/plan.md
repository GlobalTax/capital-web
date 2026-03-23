

## Mejorar Pipeline: ocultar "Sin respuesta" y destacar campaña

### Cambios

**Archivo: `src/components/admin/campanas-valoracion/OutboundPipelineSection.tsx`**

1. **Filtrar la columna "sin_respuesta"** — En el render (línea 105), filtrar `activeStages` para excluir `stage_key === 'sin_respuesta'`.

2. **Destacar el nombre de campaña** — En cada card de empresa (líneas 162-166), mostrar el nombre de campaña con más visibilidad: badge coloreado o etiqueta con fondo sutil en vez del texto gris pequeño actual. Algo como:
   ```tsx
   <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mt-0.5 max-w-full truncate">
     {c.campaign_name}
   </Badge>
   ```

Dos cambios puntuales en un solo archivo.

