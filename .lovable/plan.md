

## Plan: Regla de negocio — empresa solo en una sublista a la vez

### Cambios en `src/pages/admin/ContactListDetailPage.tsx`

**1. Vista de lista madre: filas bloqueadas**

En el `TableRow` (línea ~1196), cuando `isMadreList` es true y la empresa ya está en una sublista (`sublistCompanyMap?.map.has(cif)`):

- Añadir `opacity-50` a la fila
- El badge de sublista ya existe (líneas 1207-1217), se mantiene tal cual
- Modificar el menú de 3 puntos (líneas 1259-1287): si la empresa está asignada a sublista, mostrar solo "Ver en sublista" (navega a `/admin/empresas/[sublistId]`). Ocultar Editar, Mover, Copiar, Generar IA, Eliminar.

Cambio concreto en la fila:
```tsx
<TableRow key={company.id} className={cn("group/row", 
  isMadreList && company.cif && sublistCompanyMap?.map.has(company.cif.toUpperCase().trim()) && "opacity-50"
)}>
```

Cambio en el dropdown: renderizado condicional basado en una variable `isAssignedToSublist`.

**2. Validación al mover/copiar a sublista hermana**

En `handleMoveCopy` (línea ~749), antes de ejecutar la operación:

- Determinar si la lista destino es una sublista (tiene `lista_madre_id`)
- Si lo es, consultar si el CIF de la empresa ya existe en otra sublista de la misma madre
- Si existe: mostrar un modal de confirmación con el mensaje especificado
- Si el usuario confirma: ejecutar igualmente

Implementación:
- Nuevo estado: `sublistConflict` (null o `{ sublistName: string }`)
- En `handleMoveCopy`, antes de ejecutar: buscar el `lista_madre_id` de la lista destino. Si existe, consultar todas las sublistas hermanas por CIF. Si hay conflicto, setear `sublistConflict` y return (sin ejecutar).
- Nuevo `AlertDialog` que muestra el aviso y al confirmar llama a una función `executeMoveCopy()` que ejecuta la operación real.
- Extraer la lógica de ejecución actual de `handleMoveCopy` a `executeMoveCopy()`.

**3. No se tocan**: importador, trigger, pestaña Configuración, notas, búsqueda por keywords.

### Resumen de estados nuevos

```typescript
const [sublistConflict, setSublistConflict] = useState<{ sublistName: string } | null>(null);
```

### Flujo

```text
Usuario click "Mover/Copiar" → handleMoveCopy()
  ├─ lista destino es sublista?
  │   ├─ NO → executeMoveCopy() directamente
  │   └─ SÍ → CIF ya en otra sublista de la misma madre?
  │       ├─ NO → executeMoveCopy()
  │       └─ SÍ → mostrar AlertDialog con nombre de sublista conflictiva
  │                └─ "Continuar de todas formas" → executeMoveCopy()
  └─ (resto igual)
```

