

## Correccion del error critico: pagina en blanco

### Problema identificado

El error `Uncaught ReferenceError: Cannot access 'w' before initialization` en `charts-CwGLX5rB.js` es causado por la configuracion de `manualChunks` en `vite.config.ts` (linea 36-47).

Recharts y las librerias d3 tienen dependencias circulares internas. Cuando Vite/Rollup las fuerza en un chunk separado (`charts`), el orden de inicializacion de variables se rompe, causando un error de "Temporal Dead Zone" (TDZ) que impide que toda la aplicacion arranque.

El catch-all `return 'vendor'` en linea 46 agrava el problema al crear dependencias cruzadas entre chunks.

### Solucion

Simplificar la configuracion de `manualChunks` eliminando las entradas problematicas:

**Archivo: `vite.config.ts`**

Cambiar la funcion `manualChunks` para:
1. Eliminar el chunk `charts` (recharts + d3)
2. Eliminar el catch-all `vendor`
3. Mantener solo chunks seguros que no tienen dependencias circulares (pdf, editor, export)

```text
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('@react-pdf') || id.includes('jspdf')) return 'pdf';
    if (id.includes('react-quill') || id.includes('quill')) return 'editor';
    if (id.includes('xlsx') || id.includes('html2canvas')) return 'export';
    if (id.includes('@supabase')) return 'supabase';
  }
  // Sin return = Rollup decide automaticamente (evita conflictos circulares)
}
```

### Impacto

- Corrige la pagina en blanco inmediatamente
- La aplicacion carga sin errores de inicializacion
- Rollup gestiona automaticamente el splitting de recharts, d3, framer-motion y react-dom, evitando conflictos de dependencias circulares
- Los chunks de PDF, editor, export y supabase se mantienen separados (son seguros porque no tienen dependencias circulares)

### Archivo a modificar

| Archivo | Cambio |
|---|---|
| `vite.config.ts` | Simplificar manualChunks eliminando chunks problematicos (charts, framer, react-dom, vendor) |

