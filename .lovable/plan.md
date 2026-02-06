

# Plan: Mejorar Filtros y Tabla de Contactos (/admin/contacts)

## Resumen

Dos mejoras principales: (1) hacer que el filtro de **Estado** cargue opciones dinamicas desde la tabla `contact_statuses` en vez de usar valores hardcodeados, y (2) ampliar las columnas visibles en la tabla.

---

## 1. Filtro de Estado Dinamico

**Problema actual:** El filtro de Estado en `ContactsFilters.tsx` usa una lista fija de 7 opciones hardcodeadas (`nuevo`, `contactado`, etc.) que no coincide con los estados reales configurados en la base de datos (`contact_statuses`).

**Solucion:**

**Archivo:** `src/components/admin/contacts-v2/ContactsFilters.tsx`

- Importar `useContactStatuses` desde `@/hooks/useContactStatuses`
- Eliminar la constante `STATUS_OPTIONS` hardcodeada
- Reemplazar el dropdown de Estado para usar los estados activos de la base de datos
- Mostrar los labels y colores reales de cada estado (consistente con `LeadStatusBadge`)

```tsx
// Antes (hardcoded):
const STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  ...
];

// Despues (dinamico):
const { activeStatuses } = useContactStatuses();
// activeStatuses viene de la DB con label, status_key, color
```

---

## 2. Nuevas Columnas en la Tabla

**Columnas actuales (8):** Nombre, Empresa, Estado, Canal, Facturacion, EBITDA, Fecha, Valoracion

**Columnas a anadir (3):**

| Columna | Campo | Ancho | Posicion |
|---------|-------|-------|----------|
| Telefono | `phone` | 90px | Despues de Empresa |
| Formulario | `lead_form_name` | 100px | Despues de Canal |
| Sector | `industry` | 100px | Despues de Formulario |

**Nuevo grid (11 columnas):**
```
grid-cols-[2fr_1.5fr_90px_1fr_1fr_100px_100px_80px_80px_1fr_80px]
Nombre | Empresa | Telefono | Estado | Canal | Formulario | Sector | Fact. | EBITDA | Fecha | Valoracion
```

### Archivos a modificar:

**`src/components/admin/contacts-v2/VirtualContactsTable.tsx`**
- Actualizar grid-cols del header para incluir las 3 nuevas columnas
- Anadir headers: "Telefono", "Formulario", "Sector"

**`src/components/admin/contacts-v2/ContactRow.tsx`**
- Actualizar grid-cols del row (mismo que header)
- Anadir celdas:
  - **Telefono**: texto truncado con `contact.phone`
  - **Formulario**: badge con `contact.lead_form_name` (normalizado)
  - **Sector**: texto truncado con `contact.industry`

---

## 3. Filtro por Formulario (nuevo)

**Archivo:** `src/components/admin/contacts-v2/ContactsFilters.tsx`

Anadir un nuevo dropdown "Formulario" que lista los formularios unicos disponibles. El filtro `leadFormId` ya existe en el tipo `ContactFilters` y el hook `useContacts` ya lo aplica -- solo falta el boton en la UI.

- Extraer formularios unicos de los contactos cargados
- Mostrar dropdown con las opciones

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `ContactsFilters.tsx` | Usar `useContactStatuses` para el filtro de estado; anadir filtro de Formulario |
| `VirtualContactsTable.tsx` | Grid de 11 columnas con nuevos headers |
| `ContactRow.tsx` | Grid de 11 columnas con celdas de Telefono, Formulario, Sector |

No se requieren cambios en la base de datos ni en los tipos TypeScript (los campos ya existen en el tipo `Contact`).

