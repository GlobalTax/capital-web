

## Plan: Arreglar la ruta de Biblioteca de Fotos

### Problema
La ruta `/admin/photo-library` no está registrada en el router principal (`src/features/admin/components/AdminRouter.tsx`). Solo existe en `LazyAdminRouter.tsx` que no se usa. Por eso la página no muestra nada.

### Cambio
**Archivo: `src/features/admin/components/AdminRouter.tsx`**
- Añadir lazy import de `PhotoLibraryPage`
- Añadir `<Route path="/photo-library" element={<LazyPhotoLibraryPage />} />` en la sección de Content Management (junto a `lead-magnets`, `blog-v2`, etc.)

Un solo archivo, una sola línea de ruta + un import.

