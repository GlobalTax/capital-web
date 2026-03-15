

## Plan: Biblioteca de Fotos en el Admin

### Qué se construirá
Un gestor de imágenes centralizado en el panel de administración donde podrás subir, organizar, buscar y copiar URLs de fotos. Funcionará como una mediateca (similar a WordPress).

### Cambios

**1. Migración SQL: crear bucket `admin-photos`**
- Bucket público para almacenar las fotos
- RLS policies: lectura pública, escritura solo para usuarios autenticados

**2. Nuevo hook `src/hooks/usePhotoLibrary.tsx`**
- Lista todos los archivos del bucket `admin-photos` usando `supabase.storage.from('admin-photos').list()`
- Funciones: `uploadPhoto`, `deletePhoto`, `listPhotos`
- Búsqueda por nombre de archivo
- Paginación o scroll infinito

**3. Nuevo componente `src/components/admin/PhotoLibraryManager.tsx`**
- Grid de imágenes con preview (thumbnails)
- Zona de drag & drop para subir múltiples fotos a la vez
- Botón "Subir fotos" con input file múltiple
- Por cada imagen: preview, nombre, fecha, tamaño, botón copiar URL, botón eliminar
- Barra de búsqueda por nombre
- Indicador de progreso durante subida
- Dialog de confirmación para eliminar

**4. Nueva página `src/pages/admin/PhotoLibraryPage.tsx`**
- Renderiza `PhotoLibraryManager`

**5. Registrar ruta en `AdminRouter.tsx`**
- Lazy import + ruta `/admin/photo-library`

**6. Añadir al sidebar en `sidebar-config.ts`**
- En sección "📚 RECURSOS": "Biblioteca de Fotos" con icono `Image` apuntando a `/admin/photo-library`

### Flujo del usuario
1. Navega a "Biblioteca de Fotos" en el sidebar
2. Ve todas las fotos subidas en un grid visual
3. Arrastra fotos o hace clic en "Subir" para añadir nuevas
4. Copia la URL pública con un clic para usarla en blog, recursos, etc.
5. Elimina fotos que ya no necesita

