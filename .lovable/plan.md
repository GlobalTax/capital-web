

# Diagnóstico: Bug de Layout en /admin/contacts

## Causa Raíz Identificada

El problema está en un **conflicto de cálculo de altura** entre el `AdminLayout` y el componente `LinearContactsManager`.

### Análisis del DOM:

```
AdminLayout
├── div.min-h-screen.flex.w-full
│   ├── AdminSidebar (fixed, 100vh)
│   └── SidebarInset.flex-1.flex.flex-col.min-h-svh
│       ├── LinearAdminHeader (h-12, sticky top-0) ← 48px
│       ├── main.flex-1.p-2-to-4.overflow-auto
│       │   └── div.w-full.max-w-full
│       │       └── LinearContactsManager (Tabs)
│       │           className="h-[calc(100vh-48px-24px)]" ← PROBLEMA
```

### El Bug:

1. **`LinearContactsManager`** usa `h-[calc(100vh-48px-24px)]` = `calc(100vh - 72px)`
2. Pero está **anidado dentro de** `<main className="flex-1 p-2 sm:p-3 md:p-4 overflow-auto">`
3. El `main` ya tiene `flex-1` que calcula su altura dinámicamente
4. Además tiene padding (`p-2` a `p-4`) que añade espacio extra
5. El resultado: la altura calculada de `100vh - 72px` es **mayor** que el espacio disponible real
6. Esto causa que el contenido se desborde y **empuja la tabla hacia abajo**

### Por qué aparece el espacio en blanco:

El componente `Tabs` con altura fija de `100vh - 72px` excede el contenedor padre, y como el `<main>` tiene `overflow-auto`, el contenido se comporta de forma inesperada. Los `TabsContent` con `flex-1` intentan ocupar el espacio restante, pero el cálculo inicial está mal.

## Solución Propuesta (Fix Mínimo)

### Opción A: Corregir el cálculo en `LinearContactsManager.tsx` (RECOMENDADO)

Cambiar de altura fija basada en `100vh` a usar `h-full` y dejar que el contenedor padre (main) controle la altura.

**Archivo:** `src/components/admin/contacts/LinearContactsManager.tsx`

**Cambio:**
```diff
- className="h-[calc(100vh-48px-24px)] flex flex-col"
+ className="h-full flex flex-col"
```

**Y ajustar el `main` en `AdminLayout.tsx`:**
```diff
- <main className="flex-1 p-2 sm:p-3 md:p-4 overflow-auto">
-   <div className="w-full max-w-full">
+ <main className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden flex flex-col">
+   <div className="flex-1 min-h-0 w-full max-w-full flex flex-col">
```

### Detalle de los Cambios

| Archivo | Línea | Cambio | Razón |
|---------|-------|--------|-------|
| `AdminLayout.tsx` | 129 | `overflow-auto` → `overflow-hidden flex flex-col` | Evitar scroll en main, habilitar flex container |
| `AdminLayout.tsx` | 130 | Añadir `flex-1 min-h-0 flex flex-col` al wrapper | Permitir que children ocupen altura disponible |
| `LinearContactsManager.tsx` | 191 | `h-[calc(100vh-48px-24px)]` → `h-full` | Usar altura del contenedor padre, no viewport |

## Validación Visual Esperada

Después del fix:
- Los tabs + filtros aparecen **inmediatamente** debajo del header (48px)
- No hay espacio en blanco gigante
- La tabla comienza justo debajo de los filtros
- Scroll interno solo en la tabla virtualizada
- Sin doble scroll (página + tabla)

## Archivos a Modificar

1. `src/features/admin/components/AdminLayout.tsx` (2 líneas)
2. `src/components/admin/contacts/LinearContactsManager.tsx` (1 línea)

## Sección Técnica

### Patrón Correcto de Dashboard Layout

```text
┌─────────────────────────────────────────────────┐
│ SidebarProvider (min-h-svh)                     │
├──────────────┬──────────────────────────────────┤
│              │ SidebarInset (flex-1 flex-col)   │
│   Sidebar    ├──────────────────────────────────┤
│   (fixed)    │ Header (h-12, shrink-0, sticky)  │
│              ├──────────────────────────────────┤
│              │ main (flex-1 overflow-hidden)    │
│              │   └─ div (flex-1 min-h-0)        │
│              │       └─ Page (h-full flex-col)  │
│              │           ├─ Filters (shrink-0)  │
│              │           └─ Table (flex-1)      │
└──────────────┴──────────────────────────────────┘
```

### Reglas Clave:
1. **Nunca usar `100vh` en componentes anidados** - usar `h-full` y dejar que el padre controle
2. **`min-h-0`** es crítico en flex containers para permitir shrink
3. **`overflow-hidden`** en el contenedor padre + **`overflow-auto`** solo en el elemento scrolleable (la tabla)
4. **`shrink-0`** para elementos que no deben comprimirse (header, filtros)
5. **`flex-1`** solo para el elemento que debe llenar el espacio restante

