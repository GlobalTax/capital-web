

## Plan: Selector de fotos de la biblioteca en editores

### Enfoque
Crear un componente `PhotoLibraryPicker` reutilizable (modal/dialog) que permite navegar la biblioteca de fotos con carpetas y seleccionar una imagen. Integrarlo en `ImageUploadField` para que esté disponible en cualquier lugar que use ese componente (blog sidebar, recursos, etc.).

### Cambios

**1. Nuevo componente `src/components/admin/PhotoLibraryPicker.tsx`**
- Dialog modal que reutiliza la lógica de `usePhotoLibrary`
- Grid de carpetas + fotos con navegación breadcrumb (como PhotoLibraryManager pero simplificado)
- Búsqueda integrada
- Click en una foto → devuelve su `publicUrl` via callback `onSelect(url: string)`
- Botón para abrir el picker con icono `ImageIcon`

**2. Actualizar `src/components/admin/ImageUploadField.tsx`**
- Añadir un tercer botón junto a Upload y X: icono de biblioteca (`ImageIcon`)
- Al hacer click, abre `PhotoLibraryPicker`
- Cuando el usuario selecciona una foto, se llama `onChange(url)` con la URL pública

### Resultado
- En el sidebar del blog (imagen destacada) y cualquier otro sitio que use `ImageUploadField`, aparecerá un botón de biblioteca
- El usuario puede elegir entre: pegar URL, subir archivo nuevo, o seleccionar de la biblioteca existente

