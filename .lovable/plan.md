
# Plan: Corrección del Layout - Elementos `<main>` Anidados

## Problema Encontrado

He identificado el problema real después de los cambios anteriores:

### El Problema: Dos `<main>` Anidados

En `AdminLayout.tsx` hay una estructura HTML inválida:

```html
<SidebarInset>  <!-- Este componente renderiza un <main> -->
  <LinearAdminHeader />
  <main className="flex-1 overflow-hidden flex flex-col">  <!-- ¡OTRO main anidado! -->
    <div>
      {children}
    </div>
  </main>
</SidebarInset>
```

El componente `SidebarInset` (línea 321 de sidebar.tsx) **ya es un `<main>`**:
```tsx
const SidebarInset = (...) => {
  return (
    <main className="relative flex h-svh min-h-svh flex-1 flex-col...">
      {props.children}
    </main>
  )
}
```

Esto crea `<main><main>...</main></main>`, que es HTML semánticamente incorrecto y puede causar problemas de layout impredecibles en diferentes navegadores.

## Solución

Cambiar el `<main>` interno en `AdminLayout.tsx` a un `<div>`, ya que el `<main>` semántico ya viene de `SidebarInset`:

### Archivo: `src/features/admin/components/AdminLayout.tsx`

| Línea | Antes | Después |
|-------|-------|---------|
| 129 | `<main className="flex-1 overflow-hidden flex flex-col">` | `<div className="flex-1 overflow-hidden flex flex-col">` |
| 133 | `</main>` | `</div>` |

## Sección Técnica

### Estructura Corregida

```text
SidebarProvider (h-svh, overflow-hidden)
└── div.h-screen (overflow-hidden)
    └── SidebarInset → <main> (h-svh, flex-1, flex-col, overflow-hidden)
       └── LinearAdminHeader (48px, shrink-0)
       └── CommandPalette
       └── KeyboardShortcutsHelp  
       └── <div> (flex-1, overflow-hidden, flex-col)  ← ANTES era <main>
           └── <div> (flex-1, min-h-0, p-4)
               └── ContactsPage (h-full)
                   └── LinearContactsManager (flex-1, flex-col, min-h-0)
                       └── Tabs
                           └── TabsContent (sin mt-2)
                               └── Tabla
```

### Por Qué Esto Puede Solucionar el Problema

1. **HTML válido**: Un solo `<main>` semántico
2. **Flexbox más predecible**: Los navegadores manejan mejor estructuras semánticamente correctas
3. **Sin conflictos de especificidad**: Algunos navegadores aplican estilos por defecto a `<main>`

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/features/admin/components/AdminLayout.tsx` | Cambiar `<main>` interno a `<div>` (líneas 129 y 133) |

## Resultado Esperado

La tabla de contactos debe aparecer inmediatamente debajo de los tabs sin el espacio de ~450px. El `<main>` de `SidebarInset` proporciona la semántica correcta, y el `<div>` interior maneja el layout con flexbox de manera predecible.
