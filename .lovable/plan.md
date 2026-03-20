

## Arreglar descarga y añadir previsualización en Estudios de Mercado

### Problema
La descarga usa `window.open(url, '_blank')` con una URL firmada, lo cual abre el archivo en una nueva pestaña pero no fuerza la descarga. Además, no existe botón de previsualización.

### Cambios

**`src/hooks/useMarketStudies.ts`**
- Añadir función `getPublicUrl` que devuelva la URL firmada sin forzar descarga (para preview).
- Modificar `getDownloadUrl` para añadir `?download=` o usar `createSignedUrl` con `download` option para forzar descarga real.

**`src/components/admin/campanas-valoracion/MarketStudiesPanel.tsx`**

1. **Botón Descargar**: Cambiar `handleDownload` para crear un `<a>` temporal con `download` attribute que fuerce la descarga del archivo en vez de abrirlo en pestaña.

2. **Botón Previsualizar**: Añadir nuevo botón con icono `Eye` que abra la URL firmada en nueva pestaña (el comportamiento actual de `window.open`). Para PDFs se verá el visor del navegador; para PPT se abrirá para descarga.

3. **Hacer botones siempre visibles**: Quitar el `opacity-0 group-hover:opacity-100` para que los botones sean siempre accesibles (o mantenerlo pero con los botones funcionales).

### Resultado
- **Descargar**: Fuerza descarga del archivo al equipo.
- **Previsualizar**: Abre el documento en nueva pestaña (PDF se ve en el navegador).

