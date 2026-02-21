

# Filtros rápidos por estado en la tabla de procesamiento

## Problema

Con 147+ empresas en la tabla, no hay forma de filtrar por estado. El usuario tiene que hacer scroll para encontrar las que fallaron o las que ya se enviaron.

## Solucion

Añadir una fila de botones-filtro (chips/tabs) justo encima de la tabla "Resultados", con los estados: **Todos**, **Listos**, **Enviados**, **Errores**. Cada chip muestra el contador.

```
[Todos (147)] [Listos (89)] [Enviados (52)] [Errores (6)]
```

## Cambios en `ProcessSendStep.tsx`

### 1. Nuevo estado `statusFilter`

```typescript
const [statusFilter, setStatusFilter] = useState<'all' | 'calculated' | 'sent' | 'failed'>('all');
```

### 2. Lista filtrada `filteredCompanies`

```typescript
const filteredCompanies = statusFilter === 'all'
  ? companies
  : companies.filter(c => c.status === statusFilter);
```

### 3. Chips de filtro en el CardHeader de "Resultados"

Añadir botones compactos al lado del titulo "Resultados":

| Chip | Filtro | Contador |
|------|--------|----------|
| Todos | `all` | `companies.length` |
| Listos | `calculated` | `readyToSend.length` (ya existe) |
| Enviados | `sent` | `sentCompanies.length` (ya existe) |
| Errores | `failed` | `failedCompanies.length` (ya existe) |

Los chips usaran `Badge` o `Button variant="outline"` con estilo activo cuando esta seleccionado.

### 4. La tabla itera `filteredCompanies` en lugar de `companies`

Cambiar `companies.map(c => ...)` a `filteredCompanies.map(c => ...)` en el TableBody.

### 5. Ajustar seleccion (select all aplica solo a las visibles)

`toggleSelectAll` selecciona/deselecciona solo `filteredCompanies`, no todas:

```typescript
const toggleSelectAll = useCallback(() =>
  setSelectedIds(prev => {
    const filteredIds = filteredCompanies.map(c => c.id);
    const allFilteredSelected = filteredIds.every(id => prev.includes(id));
    if (allFilteredSelected) {
      return prev.filter(id => !filteredIds.includes(id));
    }
    return [...new Set([...prev, ...filteredIds])];
  }),
[filteredCompanies]);
```

El master checkbox refleja el estado de `filteredCompanies`, no de `companies`.

## Resultado visual

Antes de la tabla:
```
Resultados    [Todos 147] [Listos 89] [Enviados 52] [Errores 6]
```

Al hacer click en "Errores", solo se muestran las 6 filas con error. El master checkbox aplica solo a esas 6.

## Archivo modificado

| Archivo | Cambio |
|---------|--------|
| `ProcessSendStep.tsx` | Estado `statusFilter`, array `filteredCompanies`, chips de filtro en CardHeader, tabla usa `filteredCompanies`, `toggleSelectAll` ajustado |

