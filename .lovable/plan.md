

## Plan: Corregir y reforzar vinculación Lista Madre ↔ Sublistas

### Diagnóstico actual

Tras inspeccionar el código y esquema:

1. **`lista_madre_id`** ya existe como FK en `outbound_lists` → OK, no se necesita migración.
2. **Vista Lista Madre** — ya tiene columna "Sublistas" que muestra en qué sublista está cada empresa (por CIF) → OK, funciona.
3. **Vista Sublista** — tiene `parentList` query para breadcrumb, pero **no muestra una columna "Lista Madre"** en la tabla de empresas.
4. **Añadir empresa manual (`handleAddManual`)** — **no valida conflicto de sublista** por CIF. Inserta directamente sin comprobar si el CIF ya existe en otra sublista hermana.
5. **Import Excel** — el `enOtraLista` category actualmente se **importa** (se incluye en `rowsToInsert`). La regla de negocio dice que debería **bloquearse**.
6. **Validación import** — cuando se importa a una sublista, detecta CIFs en sublistas hermanas y los pone en `enOtraLista`. Pero cuando se importa a una lista madre, clasifica CIFs de hijos como `enOtraLista` → esto es informativo y correcto. El **conflicto real** solo aplica entre sublistas hermanas.

### Cambios necesarios

#### 1. Separar `enOtraLista` en dos categorías — `useExcelImportValidation.ts`

Actualmente `enOtraLista` mezcla dos situaciones distintas:
- **(a)** CIF en lista madre/sublista hermana de una madre → **conflicto real**, debe bloquearse
- **(b)** CIF en lista padre cuando importamos a la madre → informativo, puede importarse

Añadir nueva categoría `conflictoSublistado: ConflictRow[]` al `ValidationResult`:
- Cuando `listaMadreId` está definido (estamos importando a una sublista): los CIFs encontrados en **sublistas hermanas** van a `conflictoSublistado` (bloqueados). Los de la lista madre siguen en `enOtraLista` (importables con aviso).
- Para hacer esto, en el bucle de validación, distinguir si `relatedCifMap` entry viene de una sublista hermana vs de la madre.

Modificar el `relatedCifMap` para almacenar `{ name: string, isConflict: boolean }` en lugar de solo `string`.

#### 2. Bloquear conflictos en import — `ContactListDetailPage.tsx`

En `handleConfirmImport` (línea ~830): excluir `conflictoSublistado` de `rowsToInsert`. Solo importar `nuevas + vinculadas + enOtraLista`.

#### 3. Mostrar conflictos en modal preview — `ImportPreviewModal.tsx`

Añadir nueva sección con icono `XCircle` rojo: **"Conflicto de sublistado (se excluirán)"** mostrando empresa, CIF y nombre de la sublista donde ya existe. No contar en `importable`.

#### 4. Validar al añadir empresa manual — `ContactListDetailPage.tsx`

En `handleAddManual` (~línea 729), antes de `addCompany.mutateAsync`:
- Si la lista tiene `lista_madre_id` y el CIF no está vacío:
  - Consultar sublistas hermanas (mismo `lista_madre_id`, distinto `listId`)
  - Buscar si el CIF existe en `outbound_list_companies` de esas hermanas
  - Si existe: `toast.error("Esta empresa (CIF) ya está en el sublistado [nombre]...")` y cancelar inserción

#### 5. Columna "Lista Madre" en vista sublista — `ContactListDetailPage.tsx` + `useListColumnPreferences.ts`

- Añadir columna `{ key: 'lista_madre', label: 'Lista Madre', ... }` a `DEFAULT_COLUMNS` en `useListColumnPreferences.ts`
- En `renderColumnCell`, caso `'lista_madre'`: si `list?.lista_madre_id` existe, mostrar badge con `parentList?.name` como link a la lista madre. Solo visible si la lista actual es sublista.
- Alternativamente, dado que TODAS las empresas de una sublista comparten la misma madre, en lugar de una columna repetitiva, mostrar un badge/breadcrumb prominente en el header de la página (ya existe como breadcrumb). Dado que el usuario pide "columna o indicador visible", reforzar el breadcrumb existente con un badge más visible tipo `<Badge>Sublista de: [Madre]</Badge>` junto al título.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useExcelImportValidation.ts` | Añadir `conflictoSublistado` al resultado, separar conflictos reales de informativos |
| `src/components/admin/contact-lists/ImportPreviewModal.tsx` | Nueva sección "Conflicto de sublistado", excluir del conteo importable |
| `src/pages/admin/ContactListDetailPage.tsx` | Validación CIF en `handleAddManual`, ajustar `handleConfirmImport`, badge "Lista Madre" en header de sublistas |
| `src/hooks/useListColumnPreferences.ts` | Añadir columna `lista_madre` a defaults |

### Sin cambios en base de datos
Todo se resuelve con lógica client-side. El esquema ya tiene `lista_madre_id`.

