

## Corregir color y hacer editable la seccion "Areas de practica"

### 1. Corregir texto gris a negro

El texto "para tu empresa" en la linea 77 de `PracticeAreasSection.tsx` usa `text-muted-foreground` (gris). Se cambiara a `text-foreground` (negro) para cumplir el estandar tipografico.

### 2. Crear tabla en base de datos para las tarjetas de servicios

Se creara una tabla `practice_area_cards` con los campos necesarios para gestionar cada tarjeta:

```text
practice_area_cards
- id (UUID, PK)
- title (TEXT) - ej: "Venta de empresas"
- description (TEXT) - texto que aparece al hover
- image_url (TEXT) - URL de la imagen
- href (TEXT) - enlace de destino
- display_order (INTEGER) - orden de aparicion
- is_active (BOOLEAN, default true)
- created_at / updated_at (TIMESTAMPS)
```

Las imagenes se subiran al bucket `hero-images` existente (reutilizandolo).

### 3. Crear administrador en el panel

Un nuevo componente `PracticeAreasManager.tsx` en `/admin/practice-areas` que permita:
- Ver las 4 tarjetas actuales
- Editar titulo, descripcion, enlace e imagen de cada una
- Subir nuevas fotos
- Reordenar con drag-and-drop
- Activar/desactivar tarjetas

Se anadira al sidebar del admin bajo "GESTIONAR DATOS" junto a "Hero Slides".

### 4. Hacer dinamico el componente publico

`PracticeAreasSection.tsx` pasara de datos hardcodeados a cargar desde Supabase con React Query, mostrando solo las tarjetas activas ordenadas por `display_order`.

### Seccion tecnica

**Archivos a modificar:**
- `src/components/home/PracticeAreasSection.tsx` - Color del texto + carga dinamica desde DB
- `src/features/admin/config/sidebar-config.ts` - Anadir entrada "Areas de Practica"
- `src/features/admin/components/AdminRouter.tsx` - Anadir ruta `/admin/practice-areas`

**Archivos a crear:**
- `src/components/admin/PracticeAreasManager.tsx` - Panel de gestion CRUD

**Migracion SQL:**
- Crear tabla `practice_area_cards` con RLS
- Insertar los 4 registros iniciales con las imagenes actuales
- Politica SELECT publica, INSERT/UPDATE/DELETE solo admin

