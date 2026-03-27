

## Plan: Gestión de Testimonios de Colaboradores desde Admin

### Problema
Los testimonios de la sección "Lo que dicen nuestros colaboradores" en `/programa-colaboradores` están **hardcodeados** en el componente. No se pueden editar desde el panel admin.

### Cambios

#### 1. Migración SQL — Nueva tabla `collaborator_testimonials`
Crear tabla con campos: `name`, `position`, `company`, `sector`, `rating`, `testimonial_text`, `joined_year`, `avatar_initials`, `is_active`, `display_order`. Habilitar RLS con políticas de lectura pública y escritura para autenticados.

#### 2. Nuevo componente `CollaboratorTestimonialsManager.tsx`
Componente admin CRUD siguiendo el patrón existente de `TestimonialsManager.tsx`:
- Listado con tarjetas mostrando nombre, sector, año
- Formulario dialog para crear/editar (nombre, posición, empresa, sector, rating 1-5, texto, año incorporación, iniciales avatar)
- Botones para activar/desactivar y eliminar
- Ordenación por `display_order`

#### 3. Registrar ruta y sidebar
- **`AdminRouter.tsx`**: Añadir ruta `/collaborator-testimonials` con lazy component
- **`LazyAdminComponents.tsx`**: Añadir lazy import
- **`sidebar-config.ts`**: Añadir entrada "Test. Colaboradores" en la sección de Team & Testimonials

#### 4. Hook `useCollaboratorTestimonials.ts`
Hook con React Query para fetch de testimonios activos, ordenados por `display_order`.

#### 5. Actualizar `TestimonialsSection.tsx`
Reemplazar datos hardcodeados por el hook. Mantener el diseño actual exactamente igual, solo cambiar la fuente de datos de i18n a base de datos.

### Resultado
Desde `/admin/collaborator-testimonials` se podrán añadir, editar, activar/desactivar y eliminar testimonios de colaboradores, y se reflejarán automáticamente en la web pública.

