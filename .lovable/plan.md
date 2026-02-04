
# Plan: Corregir Espacio Vacío en /admin/contacts

## Problema Identificado

La captura muestra un **enorme espacio blanco vacío** entre el header de tabs ("Leads") y el contenido (stats, filtros, tabla). El contenido aparece "empujado" al fondo de la pantalla.

### Causa Raíz

La cadena de propagación de altura está rota:

```
AdminLayout (flex-1)
  └─ main (flex-1, flex-col)
      └─ div (flex-1, min-h-0, flex-col)
          └─ ContactsPage ❌ (sin h-full ni flex-1)
              └─ LinearContactsManager
                  └─ Tabs (h-full) ← No tiene referencia de altura padre
```

El componente `ContactsPage.tsx` no tiene clases de altura, por lo que el `h-full` del `Tabs` en `LinearContactsManager` no tiene un contenedor con altura definida del cual heredar.

## Solución

### Archivo 1: `src/pages/admin/ContactsPage.tsx`

Añadir `h-full` al wrapper del componente para que la altura se propague correctamente:

**Antes:**
```tsx
const ContactsPage = () => {
  return <LinearContactsManager />;
};
```

**Después:**
```tsx
const ContactsPage = () => {
  return (
    <div className="h-full flex flex-col">
      <LinearContactsManager />
    </div>
  );
};
```

### Archivo 2: `src/components/admin/contacts/LinearContactsManager.tsx` (Opcional)

Como medida adicional de seguridad, cambiar `h-full` por `flex-1` en el Tabs para que use el espacio disponible del padre flex en lugar de depender de altura heredada:

**Antes:**
```tsx
<Tabs 
  value={activeTab} 
  onValueChange={(v) => setActiveTab(v as 'favorites' | 'directory' | 'pipeline' | 'stats')} 
  className="h-full flex flex-col"
>
```

**Después:**
```tsx
<Tabs 
  value={activeTab} 
  onValueChange={(v) => setActiveTab(v as 'favorites' | 'directory' | 'pipeline' | 'stats')} 
  className="flex-1 flex flex-col min-h-0"
>
```

## Sección Técnica

### Flujo de Altura Corregido

```
AdminLayout
  └─ SidebarInset (flex-1, flex-col)
      └─ main (flex-1, p-4, overflow-hidden, flex-col)
          └─ div (flex-1, min-h-0, flex-col)
              └─ ContactsPage (h-full, flex-col) ✓
                  └─ LinearContactsManager
                      └─ Tabs (flex-1, flex-col, min-h-0) ✓
                          └─ TabsContent (flex-1, flex-col, min-h-0)
                              └─ LinearContactsTable (flex-1)
```

### Claves del Arreglo

| Propiedad | Propósito |
|-----------|-----------|
| `h-full` | Hereda el 100% de altura del padre |
| `flex-1` | Ocupa todo el espacio disponible en un contenedor flex |
| `min-h-0` | Permite que el contenido flex se contraiga (necesario para overflow) |
| `flex flex-col` | Establece dirección de columna para hijos |

### Verificación

Para verificar que el arreglo funciona:
1. El contenido (stats, filtros, tabla) debe aparecer inmediatamente debajo de los tabs
2. La tabla virtualizada debe ocupar todo el espacio vertical restante
3. No debe haber scroll global en la página, solo scroll dentro de la tabla

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/admin/ContactsPage.tsx` | Envolver en contenedor con `h-full flex flex-col` |
| `src/components/admin/contacts/LinearContactsManager.tsx` | Cambiar `h-full` por `flex-1 min-h-0` en Tabs |

## Resultado Esperado

```
+------------------------------------------+
| Leads [Favoritos] [Todos] [Pipeline]...  | <- 32px header
+------------------------------------------+
| Total: 1207 | Valoraciones: 1000 | ...   | <- 24px stats (inmediato, sin gap)
+------------------------------------------+
| [Buscar] [Origen] [Estado] [Email]...    | <- 28px filtros
+------------------------------------------+
| ☐ | Contacto | Fecha | Canal | ...       | <- Header tabla
| ☐ | María G. | 04 feb| Google|           | <- Filas
| ☐ | Jaime S. | 03 feb| Meta  |           |
|   ... tabla ocupa resto de pantalla      |
+------------------------------------------+
```
