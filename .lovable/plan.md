

## Plan: Añadir "Biblioteca de Fotos" al sidebar del admin

Añadir un nuevo item en el grupo **"🎨 Gestión de Contenido"** del archivo `src/components/admin/navigation/navigationData.ts`.

### Cambios

1. **`src/components/admin/navigation/navigationData.ts`**:
   - Importar el icono `ImageIcon` (o `Image`) de `lucide-react`
   - Añadir al array de items del grupo "Gestión de Contenido":
     ```ts
     {
       title: "Biblioteca de Fotos",
       icon: ImageIcon,
       id: "photo-library",
       description: "Gestiona y organiza fotos",
       keywords: ["fotos", "imágenes", "biblioteca", "media", "galería"]
     }
     ```

Es un cambio de una sola línea lógica. La ruta `/admin/photo-library` ya existe en el router.

