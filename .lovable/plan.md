

## Plan: Sistema completo de gestión de Recursos (Lead Magnets)

### Problema actual
El botón "Nuevo Lead Magnet" no tiene `onClick` — no hace nada. No hay formulario para crear, editar, eliminar ni subir archivos. El manager solo lista los recursos existentes.

### Solución
Crear un sistema CRUD completo con dialog modal para crear/editar recursos, subida de archivos PDF al bucket `lead-magnets` (ya existe y es público), y acciones de editar/eliminar/cambiar estado en cada card.

### Cambios

**1. Nuevo componente `src/components/admin/lead-magnets/LeadMagnetFormDialog.tsx`**
- Dialog modal con formulario completo: título, tipo, sector, descripción, slug (auto-generado desde título), meta_title, meta_description
- Subida de archivo PDF (file_url) al bucket `lead-magnets` en Supabase Storage
- Subida de imagen destacada (featured_image_url) con preview
- Selector de estado (draft/active/archived)
- Modo crear y modo editar (recibe `leadMagnet` opcional como prop)

**2. Refactorizar `src/components/admin/LeadMagnetsManager.tsx`**
- Conectar botón "Nuevo" al dialog de creación
- Añadir botones de acción en cada card: Editar (abre dialog), Eliminar (con confirmación), Cambiar estado
- Usar las mutaciones existentes de `useLeadMagnets` (createLeadMagnet, updateLeadMagnet, toggleStatus, deleteLeadMagnet)
- Añadir dropdown menu en cada card con las acciones

**3. Actualizar `src/hooks/useLeadMagnets.tsx`**
- Añadir función `uploadResourceFile` para subir PDFs al bucket `lead-magnets`
- Añadir función `uploadFeaturedImage` para imágenes
- Corregir el queryKey (actualmente usa `'lead_magnets'` en el hook pero `'leadMagnets'` en el invalidate del manager)

### Flujo del usuario
1. Click "Nuevo Recurso" → se abre dialog con formulario
2. Rellena título (se auto-genera slug), tipo, sector, descripción
3. Sube PDF y/o imagen destacada
4. Guarda como borrador o activo
5. En la lista puede editar, cambiar estado o eliminar cada recurso

### Bucket
El bucket `lead-magnets` ya existe y es público — no necesita migración SQL.

