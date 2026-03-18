

## Plan: Bloquear eliminación de empresas en listas madre

### Regla de negocio
Las empresas que pertenecen a una **lista madre** no pueden eliminarse (ni individual ni masivamente), pero sí pueden copiarse a sublistas. Actualmente el botón "Eliminar seleccionadas" aparece sin restricción.

### Cambios en `ContactListDetailPage.tsx`

**1. Ocultar/deshabilitar "Eliminar seleccionadas" en bulk bar (~línea 1799)**
- Si `isMadreList` es `true`, no mostrar el botón `<Button variant="destructive">Eliminar seleccionadas</Button>`.

**2. Proteger `handleDeleteSelected` (~línea 739)**
- Añadir guard: si `isMadreList`, mostrar toast de advertencia y retornar sin hacer nada.

**3. Acciones individuales por fila**
- Buscar si existe un botón/menú de eliminar por fila y aplicar la misma lógica: ocultar o deshabilitar si `isMadreList`.

**4. Mantener acciones permitidas**
- Los botones "Copiar a lista" y "Mover a lista" siguen visibles en listas madre.

### Archivo

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListDetailPage.tsx` | Condicionar eliminación bulk e individual a `!isMadreList` |

