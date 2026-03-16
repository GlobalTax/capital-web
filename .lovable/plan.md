

## Plan: Añadir indicadores de progreso a la importación Excel

### Problema
Cuando el usuario sube un archivo Excel en la página de listas de contacto, no hay ningún feedback visual durante:
1. **Lectura del archivo** — el `FileReader` lee el archivo en background sin mostrar nada
2. **Validación** — el botón dice "Validando..." pero no hay barra de progreso ni indicador claro
3. **Importación** — el `ImportPreviewModal` ya muestra progreso, pero si el modal se cierra o hay un error, el usuario queda sin saber qué pasa

### Solución

**Archivo: `src/pages/admin/ContactListDetailPage.tsx`**

1. **Añadir estado `isReadingFile`** para trackear la lectura del Excel
2. **En `onDrop`**: activar `isReadingFile = true` al inicio, desactivar cuando termina de parsear. Añadir un toast de info "Leyendo archivo..." al soltar el archivo
3. **En la zona de dropzone**: cuando `isReadingFile` es true, mostrar un spinner con "Leyendo archivo..." en lugar de la zona de arrastrar
4. **En la validación**: mostrar una barra de progreso o spinner más visible debajo del botón "Validar"
5. **Toast de confirmación**: añadir `toast.success` cuando el archivo se lee correctamente ("X filas encontradas")
6. **Toast durante importación**: añadir `toast.loading` al iniciar `handleConfirmImport` que se actualice con el progreso

### Cambios concretos

| Ubicación | Cambio |
|-----------|--------|
| Estado (línea ~525) | Añadir `isReadingFile` state |
| `onDrop` (línea ~595) | Set `isReadingFile` true/false + toast de éxito al terminar |
| Dropzone UI (línea ~1660) | Mostrar spinner cuando `isReadingFile` es true |
| Validación (línea ~1705) | Añadir indicador visual más claro durante validación |

