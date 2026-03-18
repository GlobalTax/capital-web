

## Excluir operaciones individuales de la ROD

### Enfoque
Añadir al modal `GenerateDealhubModal` un paso intermedio expandible por sección donde se listen las operaciones con checkboxes, permitiendo deseleccionar las que no se quieran incluir. Las operaciones excluidas se filtran antes de pasarlas a `generateDealhubPptx`.

### Cambios

**1. `GenerateDealhubModal.tsx`**
- Añadir estado `excludedOpIds: Set<string>` (vacío por defecto = todas incluidas).
- Debajo de cada sección en el checklist, añadir un desplegable/acordeón que liste las operaciones de esa sección con un checkbox individual y el nombre de la empresa.
- Al hacer click en una operación, se añade/quita su `id` del set de excluidas.
- El contador de cada sección refleja solo las no-excluidas.
- Al generar, filtrar `activeOps` excluyendo los IDs del set antes de pasarlos a `generateDealhubPptx`.
- Hacer el modal un poco más ancho (`sm:max-w-[560px]`) y el listado scrolleable (`max-h-[40vh] overflow-y-auto`).

**2. Sin cambios en `generateDealhubPptx.ts`** — la función ya recibe las operaciones filtradas.

### UX
- Por defecto todas las operaciones están incluidas (opt-out).
- Cada sección muestra un botón de expansión (chevron) para ver/ocultar sus operaciones.
- Las operaciones excluidas aparecen con texto tachado y checkbox desmarcado.
- El subtítulo del modal muestra "X de Y operaciones seleccionadas".

