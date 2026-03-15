

## Plan: Carpetas en la Biblioteca de Fotos

### Enfoque
Usar **carpetas de Supabase Storage** (subdirectorios dentro del bucket `admin-photos`). No se necesita tabla nueva en la base de datos — Supabase Storage soporta carpetas nativamente mediante prefijos en el path de los archivos.

### Cambios

**1. Hook `src/hooks/usePhotoLibrary.tsx`**
- Añadir estado `currentFolder` (string, default `''` = raíz)
- `list()` pasa `currentFolder` como primer argumento para listar solo esa carpeta
- Separar resultados en carpetas (items con `id: null`) y archivos
- Nueva función `createFolder(name)`: sube un `.emptyFolderPlaceholder` dentro del subdirectorio
- `uploadPhotos` sube archivos al `currentFolder` actual (prefijo `folder/filename`)
- `deletePhoto` usa el path completo incluyendo carpeta
- Nueva función `deleteFolder(name)`: lista contenido y elimina todo recursivamente
- Actualizar `getPublicUrl` para incluir el path de carpeta

**2. Componente `src/components/admin/PhotoLibraryManager.tsx`**
- Añadir barra de navegación breadcrumb (Inicio > Carpeta actual) para navegar entre niveles
- Botón "Nueva carpeta" con dialog simple (input de nombre)
- Renderizar carpetas como tarjetas con icono `FolderIcon` antes del grid de fotos
- Click en carpeta → navegar a ese subdirectorio
- Botón "Atrás" o breadcrumb para volver al nivel superior
- Opción de eliminar carpeta vacía (con confirmación)
- Al subir fotos, se suben a la carpeta activa

### Flujo
1. Usuario ve raíz con carpetas + fotos sueltas
2. Clic en "Nueva carpeta" → escribe nombre → se crea
3. Clic en carpeta → entra, ve sus fotos
4. Sube fotos → van a la carpeta actual
5. Breadcrumb para volver atrás

