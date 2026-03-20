

## Agrupar listas por Lista Madre en pestañas Outbound y Compradores

### Qué cambia

En las pestañas **Outbound** y **Potenciales Compradores**, las carpetas colapsables pasarán de agruparse por **sector** a agruparse por **Lista Madre**. Las listas sin madre aparecerán sueltas al final, sin carpeta.

### Cómo funciona

- Cada carpeta colapsable mostrará el **nombre de la Lista Madre** como título (con icono Crown), junto al badge de cantidad de sublistas y total de empresas.
- Dentro de cada carpeta: tabla con las sublistas vinculadas a esa madre.
- Las listas que **no tienen `lista_madre_id`** se renderizan como filas sueltas en una tabla plana debajo de los grupos.
- La pestaña **Listados Madre** sigue igual (tabla plana sin carpetas).

### Cambios técnicos

**Archivo: `src/pages/admin/ContactListsPage.tsx`**

1. **Nuevo `useMemo` para agrupar por madre** — Reemplazar/complementar `groupedBySector` con un `groupedByMadre` que:
   - Recorre `filtered` y agrupa por `lista_madre_id`
   - Para cada madre, busca su nombre en `lists` (ya disponible en el hook)
   - Las listas sin `lista_madre_id` van a un array separado (`orphanLists`)
   - Ordena los grupos alfabéticamente por nombre de madre

2. **Renderizado condicional en las pestañas Outbound/Compradores** — En la zona donde actualmente se usa `groupedBySector.map(...)`, usar `groupedByMadre` en su lugar:
   - Carpetas colapsables con nombre de madre + Crown icon
   - Debajo, tabla plana con `orphanLists` (si las hay)

3. **Mantener `groupedBySector` y filtros de sector** — No se elimina nada. Los filtros de sector siguen funcionando para filtrar la lista antes del agrupamiento por madre. Solo cambia la agrupación visual.

4. **Estado `expandedSectors`** — Se reutiliza renombrándolo conceptualmente (o usando un segundo Set `expandedMadres`) para controlar qué carpetas de madre están abiertas/cerradas (colapsadas por defecto).

