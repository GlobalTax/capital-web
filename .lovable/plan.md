

## Plan: Detección cruzada de duplicados con listas hermanas/madre en importación

### Problema
Cuando importas empresas a una sublista, el sistema solo comprueba si ya existen en esa misma lista. No avisa si la empresa ya está en la lista madre o en otras sublistas hermanas.

### Solución
Añadir una nueva categoría de validación: **"Ya en otra lista relacionada"** (icono naranja). Estas empresas se importarán igualmente pero con un aviso informativo que indica en qué lista(s) ya aparecen.

### Cambios

#### 1. `src/hooks/useExcelImportValidation.ts`
- Añadir parámetro opcional `listaMadreId?: string | null` a `validate()`
- Si la lista tiene `lista_madre_id`, consultar las empresas de la lista madre y de todas las sublistas hermanas (listas con mismo `lista_madre_id`)
- Si la lista es una lista madre (no tiene `lista_madre_id` pero le pasan un flag), consultar las empresas de sus sublistas
- Nueva categoría en `ValidationResult`: `enOtraLista: ValidatedRow[]` — empresas que se importarán pero ya existen en listas relacionadas
- El flujo: duplicada en esta lista > en otra lista relacionada > vinculada al directorio > nueva

#### 2. `src/components/admin/contact-lists/ImportPreviewModal.tsx`
- Añadir sección con icono naranja `GitBranch` para "Ya en lista relacionada (se importarán con aviso)"
- Mostrar en cada fila el nombre de la lista donde ya existe
- Sumar `enOtraLista.length` al total importable

#### 3. `src/components/admin/contact-lists/ImportResultModal.tsx`
- Añadir línea de resumen para empresas que estaban en listas relacionadas

### Ficheros editados
- `src/hooks/useExcelImportValidation.ts`
- `src/components/admin/contact-lists/ImportPreviewModal.tsx`
- `src/components/admin/contact-lists/ImportResultModal.tsx`
- Caller de `validate()` (para pasar `listaMadreId`)

