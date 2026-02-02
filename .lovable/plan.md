
# Plan: Arreglar Selector "Formulario" para que "Sin asignar" funcione correctamente

## Problema Identificado

Al analizar el código, encontré la causa raíz del problema en el componente `EditableSelect.tsx`:

### Causa 1: Conversión incorrecta a string vacío
```typescript
// Línea 82 - EditableSelect.tsx
const actualValue = newValue === CLEAR_VALUE ? '' : newValue;
```
Cuando se selecciona "Sin asignar" (`__clear__`), el valor se convierte a **string vacío (`''`)** en lugar de **`null`**. Esto significa que se guarda `''` en la base de datos, no `NULL`.

### Causa 2: "Sin asignar" no aparece si ya es NULL
```typescript
// Línea 135 - EditableSelect.tsx
{allowClear && value && (
  <SelectItem value={CLEAR_VALUE}>...
```
La opción "Sin asignar" **solo aparece si `value` tiene un valor**. Si el campo ya es NULL/vacío, la opción desaparece del dropdown.

---

## Verificación de Base de Datos

- El campo `lead_form` es tipo `TEXT` con `is_nullable: YES` en todas las tablas de leads
- **No hay constraint que impida NULL** — la DB está correcta
- El problema es 100% frontend

---

## Cambios a Implementar

### 1. Modificar `EditableSelect.tsx`

**Archivo**: `src/components/admin/shared/EditableSelect.tsx`

#### Cambio A: Enviar `null` en lugar de string vacío

```typescript
// ANTES (línea 82)
const actualValue = newValue === CLEAR_VALUE ? '' : newValue;

// DESPUÉS
const actualValue = newValue === CLEAR_VALUE ? null : newValue;
```

#### Cambio B: Modificar el callback onSave para aceptar null

```typescript
// ANTES (línea 23)
onSave: (newValue: string) => Promise<void>;

// DESPUÉS
onSave: (newValue: string | null) => Promise<void>;
```

#### Cambio C: Mostrar "Sin asignar" siempre cuando allowClear=true

```typescript
// ANTES (línea 135)
{allowClear && value && (

// DESPUÉS - siempre mostrar si allowClear está activo
{allowClear && (
```

#### Cambio D: Comparación correcta con null

```typescript
// ANTES (línea 73)
if (actualValue === value) {

// DESPUÉS - comparar correctamente incluyendo null
if (actualValue === value || (actualValue === null && (value === '' || value === null || value === undefined))) {
```

---

### 2. Verificar `useContactInlineUpdate` (sin cambios necesarios)

El hook ya maneja correctamente cualquier valor que reciba, incluyendo `null`. El `mappedField` para `lead_form` está correctamente configurado y no tiene ningún guard que bloquee valores falsy.

```typescript
// Ya existe - no necesita cambios
const payload: Record<string, any> = { [mappedField]: value };
```

---

## Resumen de Archivos

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/shared/EditableSelect.tsx` | Enviar `null` en vez de `''`, mostrar "Sin asignar" siempre, actualizar tipo de callback |

---

## Comportamiento Esperado Post-Fix

| Escenario | Resultado |
|-----------|-----------|
| Lead con formulario asignado → Seleccionar "Sin asignar" | Guarda `NULL` en DB, UI muestra "—" |
| Lead sin formulario (NULL) → Abrir dropdown | "Sin asignar" aparece visible como opción |
| Refrescar página después de guardar NULL | Sigue mostrando "—" correctamente |
| Funciona en tab "Todos" | ✅ |
| Funciona en tab "Favoritos" | ✅ |
| Otros campos inline siguen funcionando | ✅ (misma lógica) |

---

## Pruebas a Realizar

1. **En "Todos"**:
   - Seleccionar un formulario cualquiera → Verificar que se guarda
   - Seleccionar "Sin asignar" → Verificar que se guarda como NULL en DB
   - Refrescar página → Verificar que sigue mostrando "—"

2. **En "Favoritos"**:
   - Repetir los mismos pasos

3. **Edge cases**:
   - Lead que ya tiene NULL → Dropdown debe mostrar "Sin asignar" como opción seleccionable
   - Cambios rápidos → No debe bloquearse (ya hay debounce de 500ms)
