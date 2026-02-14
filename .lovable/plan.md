
## Agregar "Calendario de Contenido" al Sidebar del Admin

### Cambio
Insertar un nuevo registro en la tabla `sidebar_items` dentro de la seccion "CREAR CONTENIDO" (id: `b2c3f379-c3b6-4492-91d7-44649aeac3d9`).

### Detalles
- **Titulo**: Calendario Editorial
- **URL**: `/admin/content-calendar`
- **Icono**: `Calendar` (Lucide)
- **Badge**: `NEW`
- **Posicion**: 1 (segundo lugar, justo despues de "AI Content Studio")
- Los demas items de la seccion se desplazaran una posicion hacia abajo

### Implementacion
1. Ejecutar un `INSERT` en `sidebar_items` con los datos del nuevo enlace
2. Actualizar las posiciones de los items existentes (posiciones 1-5 pasan a 2-6) para mantener el orden correcto

No requiere cambios en archivos de codigo, ya que el sidebar se carga dinamicamente desde la base de datos.
