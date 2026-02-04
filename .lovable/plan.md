
# Plan: Reemplazo Completo del Sistema de Contactos

## Resumen Ejecutivo

El sistema actual de contactos tiene una arquitectura demasiado compleja que causa problemas recurrentes de layout y altura. Este plan propone un reemplazo completo con una arquitectura más simple, usando CSS Grid/Flexbox nativo en lugar de cálculos dinámicos de altura.

## Problemas del Sistema Actual

| Problema | Causa | Impacto |
|----------|-------|---------|
| Altura incorrecta en tabs | `ResizeObserver` + cálculos dinámicos | Espacio en blanco masivo |
| Suscripciones duplicadas | Nombre fijo de canal Supabase | Errores en consola |
| Complejidad excesiva | ~30 archivos, 1278 líneas en hook principal | Difícil de mantener |
| Dependencias circulares | Componentes que importan de otros | Bugs intermitentes |

## Nueva Arquitectura Propuesta

```text
ContactsPage (nuevo)
├── ContactsLayout (CSS Grid, altura 100%)
│   ├── ContactsHeader (tabs + acciones)
│   ├── ContactsFilters (barra de filtros)
│   └── ContactsContent (contenido según tab)
│       ├── ContactsTableView (tabla virtualizada)
│       ├── ContactsPipelineView (kanban)
│       └── ContactsStatsView (estadísticas)
│
├── useContacts (hook simplificado)
│   ├── fetchContacts
│   ├── filterContacts
│   └── subscribeToChanges
│
└── Shared Components
    ├── VirtualTable (genérico, reutilizable)
    └── ContactRow (fila simple)
```

## Componentes a Crear

### 1. ContactsLayout.tsx (NUEVO)
Contenedor principal con CSS Grid que elimina cálculos de altura:

```tsx
// Layout fijo con grid, sin cálculos dinámicos
<div className="h-full grid grid-rows-[auto_auto_1fr] overflow-hidden">
  <header>{/* Tabs + acciones */}</header>
  <div>{/* Filtros */}</div>
  <main className="overflow-hidden">{/* Tabla/Pipeline/Stats */}</main>
</div>
```

### 2. useContacts.tsx (SIMPLIFICADO)
Hook reducido de 1278 líneas a ~300 líneas:
- Sin lógica de filtrado compleja en el hook
- Filtrado delegado a useMemo en el componente
- Canal Supabase con ID único automático

### 3. VirtualContactsTable.tsx (NUEVO)
Tabla virtualizada simple que usa `height: 100%` del padre:

```tsx
// Sin useState para altura, usa CSS
<div className="h-full" ref={containerRef}>
  <List
    height={containerHeight} // Leído una vez del contenedor
    itemCount={contacts.length}
    itemSize={40}
  >
    {Row}
  </List>
</div>
```

### 4. ContactRow.tsx (SIMPLIFICADO)
Fila de contacto reducida de 484 a ~150 líneas:
- Menos props, más autonomía
- Sin inline editing complejo
- Click para abrir modal de edición

## Archivos a Eliminar

| Archivo | Razón |
|---------|-------|
| `LinearContactsManager.tsx` | Reemplazado por ContactsLayout |
| `LinearContactsTable.tsx` | Reemplazado por VirtualContactsTable |
| `LinearFilterBar.tsx` (882 líneas) | Reemplazado por ContactsFilters simple |
| `ContactTableRow.tsx` (484 líneas) | Reemplazado por ContactRow simple |
| `CompactStatsBar.tsx` | Integrado en header |
| `ContactFilters.tsx` | Redundante |
| `ContactsManager.tsx` | Wrapper innecesario |

## Archivos a Crear

| Archivo | Descripción | Líneas aprox. |
|---------|-------------|---------------|
| `ContactsLayout.tsx` | Layout principal con grid | ~80 |
| `ContactsHeader.tsx` | Tabs + acciones bulk | ~100 |
| `ContactsFilters.tsx` | Barra de filtros compacta | ~200 |
| `VirtualContactsTable.tsx` | Tabla virtualizada simple | ~150 |
| `ContactRow.tsx` | Fila de contacto | ~120 |
| `useContacts.ts` | Hook simplificado | ~300 |

**Total nuevo**: ~950 líneas vs ~3,500 líneas actuales (73% reducción)

## Estrategia de Altura (Solución Definitiva)

En lugar de calcular alturas dinámicamente, usar CSS puro:

```css
/* En la página */
.contacts-page {
  height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
}

/* El contenedor de la tabla */
.table-container {
  height: 100%;
  overflow: hidden;
}
```

El componente de tabla leerá `offsetHeight` del contenedor una sola vez al montar, sin ResizeObserver complejo.

## Gestión de Tabs

Usar `display: contents` o montar/desmontar condicionalmente para evitar el problema de tabs ocultos:

```tsx
{activeTab === 'directory' && <VirtualContactsTable contacts={contacts} />}
{activeTab === 'pipeline' && <ContactsPipelineView contacts={contacts} />}
{activeTab === 'stats' && <ContactsStatsView />}
```

Esto evita que el componente intente calcular su altura mientras está oculto.

## Sección Técnica

### Por Qué El Sistema Actual Falla

1. **Radix Tabs** usa `display: none` para tabs inactivos
2. Los componentes se montan todos pero solo uno es visible
3. `ResizeObserver` en un elemento oculto reporta altura 0
4. El fallback `Math.max(200, ...)` crea el espacio en blanco

### Por Qué La Nueva Arquitectura Funciona

1. **Montaje condicional**: Solo existe el tab activo
2. **CSS Grid nativo**: `grid-template-rows: 1fr` distribuye espacio automáticamente
3. **Sin cálculos**: La tabla hereda altura del contenedor padre
4. **Lectura única**: `offsetHeight` se lee una vez al montar, cuando ya es visible

### Migración de Datos

El hook `useContacts` mantendrá compatibilidad con:
- Tipos `UnifiedContact` y `ContactOrigin` existentes
- Funciones de filtrado y exportación
- Integración con Supabase existente

## Plan de Implementación

### Fase 1: Crear estructura base
1. Crear `ContactsLayout.tsx` con grid
2. Crear `ContactsHeader.tsx` con tabs
3. Crear `ContactsFilters.tsx` simplificado

### Fase 2: Tabla virtualizada
1. Crear `VirtualContactsTable.tsx`
2. Crear `ContactRow.tsx` simplificado
3. Implementar selección y acciones

### Fase 3: Hook simplificado
1. Crear `useContacts.ts` nuevo
2. Migrar lógica esencial de `useUnifiedContacts.tsx`
3. Simplificar subscripción realtime

### Fase 4: Integración
1. Actualizar `ContactsPage.tsx` para usar nuevo layout
2. Conectar todos los componentes
3. Verificar funcionamiento

### Fase 5: Limpieza
1. Eliminar archivos obsoletos
2. Actualizar imports
3. Testing final

## Resultado Esperado

1. **Altura correcta** en todas las pestañas, siempre
2. **Sin errores** de suscripción duplicada
3. **70% menos código** que mantener
4. **Performance mejorada** por menos cálculos
5. **Más fácil de debuggear** por arquitectura simple
