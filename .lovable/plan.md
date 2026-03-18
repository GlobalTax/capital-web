

## Entiendo perfectamente el flujo

El concepto ya está mayoritariamente implementado:
- **En la lista madre**: cada empresa muestra un badge ámbar con el nombre de la sublista a la que pertenece (columna "sublistas").
- **En la sublista**: aparece un breadcrumb + badge indicando "Lista Madre: [nombre]".
- **Al copiar empresas desde una lista madre**, la nueva lista se crea automáticamente como sublista (con `lista_madre_id` apuntando a la madre).

### Problema detectado

Hay una inconsistencia con la regla de negocio: el botón **"Mover a lista"** sigue visible en listas madre. Mover = eliminar de origen + insertar en destino, lo cual viola la regla de que **empresas de una lista madre NO se pueden eliminar**. Solo debería estar disponible **"Copiar a lista"**.

### Cambio necesario

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListDetailPage.tsx` | Ocultar el botón "Mover a lista" en la barra bulk cuando `isMadreList` es `true`. Solo mostrar "Copiar a lista". Aplicar la misma restricción en el menú individual por fila. |

Esto garantiza que desde una lista madre solo puedas **copiar** empresas a sublistas, nunca moverlas.

