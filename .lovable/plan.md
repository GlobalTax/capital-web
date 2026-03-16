

## Plan: Paginación client-side en la Biblioteca de Fotos

### Enfoque
La RPC `list_admin_photos` devuelve todos los archivos de una carpeta en una sola query. Modificar la RPC para paginación server-side añadiría complejidad innecesaria (la query ya es rápida con el CTE). La solución más limpia es **paginación client-side con "Cargar más"** — mostrar N fotos inicialmente e ir cargando más al hacer scroll o pulsar un botón.

Usaremos el hook `useInfiniteScroll` que ya existe en el proyecto para activar la carga automática al llegar al final del grid.

### Cambios

**1. `src/hooks/usePhotoLibrary.tsx`** — Añadir paginación client-side
- Nuevo estado `visibleCount` (inicializado a 40)
- `photos` devuelve solo `allPhotos.slice(0, visibleCount)` 
- Función `loadMorePhotos` que incrementa `visibleCount` en 40
- Propiedad `hasMorePhotos` = `visibleCount < allPhotos.length`
- Reset de `visibleCount` cuando cambia `currentFolder` o `search`
- Exportar `loadMorePhotos` y `hasMorePhotos`

**2. `src/components/admin/PhotoLibraryManager.tsx`** — Integrar infinite scroll
- Importar `useInfiniteScroll` del hook existente
- Desestructurar `loadMorePhotos` y `hasMorePhotos` del hook
- Usar `useInfiniteScroll(loadMorePhotos, hasMorePhotos)` para obtener `sentinelRef`
- Colocar `<div ref={sentinelRef} />` justo después del grid de fotos
- Mostrar spinner de carga cuando `loading` del infinite scroll esté activo
- Actualizar el contador del header para mostrar "X de Y fotos"

**3. `src/components/admin/PhotoLibraryPicker.tsx`** — Misma lógica para el picker
- Aplicar la misma paginación al grid del picker (que también usa `usePhotoLibrary`)

### Resultado
- Carga inicial rápida: solo 40 thumbnails se renderizan
- Scroll infinito automático al llegar al final
- Sin cambios en la base de datos
- 3 archivos editados

