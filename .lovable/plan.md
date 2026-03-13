

## Plan: Subapartados en Listas de Contacto con Tabs

### Concepto
Añadir 3 tabs en la parte superior de la página:
- **Listados Madre**: Listas que tienen al menos una sublista (otra lista con `lista_madre_id` apuntando a ella)
- **Potenciales Compradores**: Listas con `tipo = 'compradores'`
- **Outbound**: Listas con `tipo = 'outbound'`

Las listas que no encajen en ninguna categoría (tipo `otros`, sin sublistas) aparecerán en Outbound como fallback.

### Cambios

#### 1. `src/hooks/useContactLists.ts`
- Añadir `lista_madre_id` al mapping de datos y a la interfaz `ContactList`
- Añadir campo computado `has_children: boolean` — se calcula comprobando si alguna otra lista tiene `lista_madre_id === id`

#### 2. `src/pages/admin/ContactListsPage.tsx`
- Añadir un estado `activeTab` con valores `'madre' | 'compradores' | 'outbound'`
- Renderizar `Tabs` / `TabsList` / `TabsTrigger` debajo del header, antes de los filtros
- Filtrar `filtered` según el tab activo:
  - `madre`: listas donde `has_children === true`
  - `compradores`: `tipo === 'compradores'`
  - `outbound`: `tipo === 'outbound'` o `tipo === 'otros'` (sin hijos)
- Mostrar contadores en cada tab badge
- El diálogo de crear lista pre-seleccionará el tipo según el tab activo

### Ficheros editados
- `src/hooks/useContactLists.ts`
- `src/pages/admin/ContactListsPage.tsx`

