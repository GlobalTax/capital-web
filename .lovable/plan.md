

## Plan: Eliminar carpetas/agrupación por sector en la pestaña "Listados Madre"

### Cambio

En `src/pages/admin/ContactListsPage.tsx`, cuando `activeTab === 'madre'`, renderizar la tabla plana (sin agrupación por carpetas de sector), igual que cuando se selecciona un solo sector. Las carpetas colapsables con `FolderOpen` solo se mostrarán en las pestañas `compradores` y `outbound`.

### Detalle técnico

En el bloque de renderizado (~línea 489-533), cambiar la condición para que también se use tabla plana cuando `activeTab === 'madre'`:

```
// Antes: solo flat si hay 1 grupo y filtro activo
groupedBySector.length === 1 && sectorFilter !== 'all'

// Después: flat si es tab madre O si hay 1 grupo con filtro
activeTab === 'madre' || (groupedBySector.length === 1 && sectorFilter !== 'all')
```

Cuando `activeTab === 'madre'`, renderizar todas las listas de `filtered` directamente en una tabla plana sin headers de carpeta.

Opcionalmente, también se puede ocultar el filtro de sector en la pestaña madre si no aporta valor.

### Archivo

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactListsPage.tsx` | Condicionar la vista agrupada por carpetas para que solo aplique en tabs `compradores` y `outbound` |

