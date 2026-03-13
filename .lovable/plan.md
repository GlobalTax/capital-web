

## Plan: Indicar en listas madre qué contactos están en sublistas

### Objetivo
En la vista de detalle de una lista madre, mostrar para cada empresa en qué sublistas aparece (por CIF), con un indicador visual en la tabla.

### Cambios

#### 1. `src/pages/admin/ContactListDetailPage.tsx`

**Nueva query**: Cuando la lista sea tipo `madre` o tenga `has_children`, consultar:
1. Sublistas: `SELECT id, name FROM outbound_lists WHERE lista_madre_id = listId`
2. Empresas de esas sublistas: `SELECT cif, list_id FROM outbound_list_companies WHERE list_id IN (sublistIds) AND cif IS NOT NULL`
3. Construir un mapa `Map<cif, string[]>` → nombres de sublistas donde aparece cada CIF

**Columna nueva en la tabla**: Añadir columna "Sublistas" (después de Empresa, antes de CIF) que muestre badges con los nombres de las sublistas donde aparece esa empresa. Si no está en ninguna, mostrar "—".

**Contador en header**: Mostrar junto al total de empresas cuántas están vinculadas a sublistas (ej: "· 45/120 en sublistas").

### Detalle UI

```text
| ☐ | Empresa        | Sublistas              | CIF      | ...
|---|----------------|------------------------|----------|
| ☐ | Acme Corp      | [Tech] [Madrid]        | B1234... |
| ☐ | Beta SA        | —                      | A5678... |
```

- Badges pequeños con estilo `bg-blue-50 text-blue-700` para cada sublista
- Solo visible cuando la lista es madre (`tipo === 'madre'` o `has_children`)

### Ficheros editados
- `src/pages/admin/ContactListDetailPage.tsx` (única modificación)

