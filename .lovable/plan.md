

## Hacer visible "Hero Slides" en el sidebar del admin

### Problema
La ruta `/admin/hero-slides` esta correctamente registrada en el router, pero el sidebar del admin se carga **dinamicamente desde la base de datos** (tablas `sidebar_sections` y `sidebar_items`), no desde el archivo estatico `sidebar-config.ts`. El item "Hero Slides" se anadio al archivo estatico pero nunca se inserto en la base de datos, por lo que no aparece en el menu.

### Solucion
Insertar el item "Hero Slides" en la tabla `sidebar_items`, asociado a la seccion de "GESTIONAR DATOS" (o la seccion equivalente en la BD).

### Pasos

1. **Consultar las secciones existentes** en `sidebar_sections` para identificar el `id` de la seccion donde encaja (probablemente "GESTIONAR DATOS" o similar).
2. **Insertar un nuevo registro** en `sidebar_items` con:
   - `title`: "Hero Slides"
   - `url`: "/admin/hero-slides"
   - `icon`: "Image"
   - `description`: "Imagenes y textos del hero principal"
   - `section_id`: el ID de la seccion correspondiente
   - `is_active`: true
   - `position`: al final de la seccion

No se requieren cambios en codigo — solo una insercion en la base de datos.
