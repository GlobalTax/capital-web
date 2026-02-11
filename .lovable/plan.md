

## Fix: "Comprador no encontrado" en /admin/corporate-buyers/new

### Causa raiz

Un bug de **una sola linea** en `CorporateBuyerDetailPage.tsx`.

La ruta `/corporate-buyers/new` no tiene parametro `:id` (es una ruta fija, no dinamica). Entonces `useParams()` devuelve `id = undefined`. La linea 86 compara:

```typescript
const isNew = id === 'new'; // undefined === 'new' → false
```

Como `isNew` es `false`, el componente intenta cargar un buyer con `id = undefined`, no encuentra nada, y muestra "Comprador no encontrado".

### Solucion

Cambiar la linea 86 de `CorporateBuyerDetailPage.tsx`:

```typescript
// ANTES (bug):
const isNew = id === 'new';

// DESPUES (fix):
const isNew = !id || id === 'new';
```

Con esto, cuando `id` es `undefined` (ruta `/new` sin param) O cuando es literalmente `'new'`, el componente entra en modo creacion y muestra el formulario.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/CorporateBuyerDetailPage.tsx` | Linea 86: cambiar `id === 'new'` a `!id \|\| id === 'new'` |

### Lo que NO se toca

- Rutas en AdminRouter.tsx (ya estan correctas)
- Hook `useCreateCorporateBuyer` (ya funciona, tiene manejo robusto de errores RLS)
- Formulario `CorporateBuyerForm` (ya esta completo con validacion Zod, profile importer, etc.)
- RLS policies (ya existen INSERT/UPDATE/SELECT/DELETE para authenticated + admin role)
- Import modal (ya existe `CorporateBuyersImportModal` funcional)
- Ningun otro modulo (Search Funds, contacts, etc.)

### Verificacion

Todo lo demas ya esta implementado correctamente:
- Formulario completo con Zod validation, profile importer, sectores, financials
- Hook `useCreateCorporateBuyer` con dedupe (error 23505), RLS error handling, y cache invalidation
- RLS policies para INSERT (admin role), SELECT, UPDATE, DELETE
- Import modal con Excel/CSV
- Redireccion post-creacion a `/admin/corporate-buyers/{id}`

### Seccion tecnica

El fix es minimo y quirurgico: solo cambia la condicion de deteccion de modo "nuevo" para cubrir el caso en que `id` es `undefined` (ruta sin parametro). No hay riesgo de efectos colaterales porque `!id` solo es `true` cuando no hay parametro en la URL, que es exactamente el caso de `/corporate-buyers/new`.

