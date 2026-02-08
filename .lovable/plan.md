

## Conectar el Hero a la base de datos y reducir el blanco

### Problema actual
1. Las imagenes del hero estan hardcodeadas en el codigo (imports estaticos de JPG) y no se pueden cambiar sin tocar codigo.
2. El gradient overlay `from-white/90 via-white/70 to-transparent` es demasiado blanco y tapa las imagenes.

### Solucion

#### 1. Conectar el Hero a la tabla `hero_slides` de Supabase

Ya existe una tabla `hero_slides` con campos perfectos: `image_url`, `title`, `subtitle`, `cta_primary_text`, `cta_primary_url`, `cta_secondary_text`, `cta_secondary_url`, `is_active`, `display_order`, `background_color`, `text_color`.

**Cambios en `src/components/Hero.tsx`**:
- Hacer fetch de los slides desde Supabase (`hero_slides` donde `is_active = true`, ordenados por `display_order`)
- Usar las imagenes estaticas actuales como fallback si no hay datos en la BD
- Mostrar `title`, `subtitle` y CTAs desde la base de datos
- Respetar `text_color` y `background_color` si estan definidos

#### 2. Reducir la opacidad del overlay blanco

Cambiar el gradient para que las imagenes se vean mas:
- De: `from-white/90 via-white/70 to-transparent`
- A: `from-white/70 via-white/40 to-transparent`

Esto mantiene la legibilidad del texto pero deja que las imagenes respiren mas.

#### 3. Panel admin para gestionar slides

**Archivo nuevo: `src/components/admin/HeroSlidesManager.tsx`**

Componente de administracion con:
- Lista de slides existentes con preview de imagen
- Formulario para editar/crear slides: titulo, subtitulo, URL de imagen, CTAs, orden, activo/inactivo
- Subida de imagenes al storage de Supabase
- Drag & drop para reordenar (usando `@hello-pangea/dnd` ya instalado)
- Toggle de activo/inactivo

**Integracion en el panel admin existente** (se buscara la ruta admin correspondiente para anadir el enlace).

#### 4. Actualizar datos en Supabase

Insertar/actualizar los 3 slides actuales en la tabla `hero_slides` con las URLs de imagen correspondientes (subidas al storage de Supabase o mantenidas como assets estaticos inicialmente).

---

### Archivos a modificar/crear

| Archivo | Accion |
|---------|--------|
| `src/components/Hero.tsx` | Modificar: fetch desde Supabase, fallback a estaticos, overlay menos blanco |
| `src/components/admin/HeroSlidesManager.tsx` | Crear: panel de gestion de slides |
| Integracion admin (ruta existente) | Modificar: anadir enlace/tab al gestor de slides |

### Detalles tecnicos

- Se usara `@tanstack/react-query` para el fetch de slides (patron existente en el proyecto)
- Subida de imagenes via Supabase Storage (bucket publico para hero images)
- Fallback graceful: si la BD no devuelve slides o falla, se muestran los 3 slides estaticos actuales
- El overlay reducido usa `from-white/70 via-white/40 to-transparent` para menos blancura manteniendo legibilidad
