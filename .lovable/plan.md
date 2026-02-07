

## Plan: Vista tipo listado Dealsuite + guardar imagen

Dos mejoras: (1) redisenar la tabla de "Deals guardados" para que se parezca al listado de Dealsuite (tarjetas en lugar de tabla), y (2) asegurar que la imagen subida se guarda y se muestra junto al deal.

### 1. Redisenar la tabla de deals como listado de tarjetas

Reemplazar el `<Table>` actual por un listado de tarjetas similar al de la captura de Dealsuite:

**Cada tarjeta tendra:**
- **Fecha** encima del titulo (texto pequeno, gris, ej. "Yesterday" o fecha formateada)
- **Titulo** en negrita como enlace/heading
- **Descripcion** truncada a 2 lineas
- **Fila inferior**: icono de ubicacion + pais/location + badges de sector
- **Lado derecho**: Revenue min/max alineado a la derecha con label "Revenue"
- **Imagen thumbnail** si existe (pequena, en la esquina)

Layout de cada tarjeta:
```text
+------------------------------------------------------------------+
| Yesterday                                    Revenue             |
| **Titulo del deal**                     min. EUR 3.000.000       |
|                                         max. EUR 20.000.000      |
| Descripcion truncada a dos lineas...                             |
|                                                                  |
| [pin] Europe (5)  [Management Consulting]  [IT Consulting]       |
+------------------------------------------------------------------+
```

### 2. Guardar imagen del deal

La edge function ya sube la imagen al bucket `dealsuite-images` y devuelve `image_url` en los datos extraidos. Solo hay que asegurar que:
- El campo `image_url` se guarda correctamente en la BD (ya se hace en `handleSave`)
- Se muestra un pequeno thumbnail en cada tarjeta del listado si existe

### Archivo a modificar

**`src/components/admin/DealsuiteSyncPanel.tsx`**
- Reemplazar la seccion de `<Table>` (lineas 303-359) por un listado de tarjetas estilo Dealsuite
- Cada tarjeta es un `div` con bordes, hover effect, y layout grid para titulo/revenue
- Los badges de sector se separan por coma y se muestran como chips individuales
- Truncar descripcion con `line-clamp-2`

No se necesitan cambios en la edge function, base de datos ni hooks (la imagen ya se guarda).

