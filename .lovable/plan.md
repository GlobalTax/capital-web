

## Plan: Añadir buscador en los desplegables de mover/copiar empresas

### Problema
Los dos modales (individual y bulk) usan un `<Select>` simple para elegir la lista destino. Cuando hay muchas listas, es difícil encontrar la correcta.

### Solución
Reemplazar los `<Select>` por un componente `<Popover>` + `<Command>` (cmdk) con input de búsqueda integrado, igual que el patrón ya usado en `LeadSearchSelect.tsx`. Esto aplica a:

1. **Modal individual** (líneas 2534-2549) — el select de lista destino
2. **Modal bulk** (líneas 2602-2610) — el select de lista destino

### Implementación en `ContactListDetailPage.tsx`

- Añadir estado local para el término de búsqueda en cada modal (`moveCopySearch`, `bulkMoveCopySearch`)
- Añadir estado para controlar apertura del popover
- Reemplazar cada `<Select>` por:
  ```
  <Popover> + <Command shouldFilter={false}>
    <CommandInput placeholder="Buscar lista..." />
    <CommandList>
      <CommandEmpty>No se encontraron listas</CommandEmpty>
      <CommandGroup>
        {listas filtradas por búsqueda → CommandItem}
      </CommandGroup>
    </CommandList>
  </Command>
  ```
- Filtrar `allLists` (y sublists en el caso de reasignación) por nombre usando el término de búsqueda
- Mostrar el nombre de la lista seleccionada en el trigger del Popover

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListDetailPage.tsx` | Reemplazar 2 `<Select>` por `<Popover>`+`<Command>` con búsqueda |

