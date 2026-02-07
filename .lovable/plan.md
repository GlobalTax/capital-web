
# Plan: Tabla de contactos full-height

## Causa raiz

La cadena de altura se rompe en `AdminLayout.tsx` linea 130. El wrapper del contenido usa `min-h-full` (que NO define una altura explicita para que los hijos hereden con `h-full`). El resultado: `ContactsPage > ContactsLayout > VirtualContactsTable` nunca recibe una altura real, y la tabla virtualizada cae al fallback de 400px.

## Solucion (1 archivo, 1 linea)

Cambiar **solo** `ContactsPage.tsx` para usar una altura calculada basada en viewport, restando el header (48px) y el padding responsivo del wrapper.

### Archivo: `src/pages/admin/ContactsPage.tsx`

Cambiar:
```tsx
<div className="h-full flex flex-col min-h-0 overflow-hidden">
```

Por:
```tsx
<div className="h-[calc(100dvh-48px-1rem)] sm:h-[calc(100dvh-48px-1.5rem)] md:h-[calc(100dvh-48px-2rem)] flex flex-col min-h-0 overflow-hidden">
```

Los valores corresponden a:
- `48px` = altura del `LinearAdminHeader`
- `1rem` / `1.5rem` / `2rem` = padding top+bottom del wrapper (`p-2` / `p-3` / `p-4`)

### Por que esta solucion

- **No toca AdminLayout**: cambiar `min-h-full` a `h-full` alli romperia otras paginas que necesitan scroll natural (dashboard, blog, etc.)
- **No toca logica de negocio**: cero cambios en filtros, queries, estados, seleccion, side panel
- **No toca VirtualContactsTable**: el ResizeObserver ya funciona correctamente; solo necesita recibir una altura real del padre
- **Responsivo**: los breakpoints coinciden exactamente con el padding del wrapper en AdminLayout

### Resultado

La cadena de altura queda: viewport calc en ContactsPage, `h-full` en ContactsLayout grid, `1fr` llena el espacio restante, ResizeObserver en VirtualContactsTable detecta la altura real, y la lista virtualizada ocupa toda la pantalla.
