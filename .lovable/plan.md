
# Plan: Rediseño Data-Dense de la Vista de Contactos (/admin/contacts)

## Diagnóstico del Problema

### Problemas Identificados

1. **Contenedor principal limitado**: `AdminLayout.tsx` (línea 130) tiene `<div className="w-full max-w-full">` - correcto, pero el componente hijo `LinearContactsManager` tiene `space-y-6` que añade demasiado espacio vertical.

2. **KPIs ocupan demasiada altura**: Los stats cards (líneas 333-350) usan `grid-cols-2 md:grid-cols-4 gap-3` con `p-4` y `text-2xl`, creando bloques de ~80px de altura.

3. **Filtros en múltiples líneas**: `LinearFilterBar.tsx` usa `space-y-3` y distribuye filtros en 3 secciones verticales (búsqueda, dropdowns, badges), ocupando ~120-150px.

4. **Altura de tabla limitada artificialmente**: En `LinearContactsTable.tsx` (línea 365) hay un `Math.min(availableHeight, 800)` que limita la altura máxima a 800px.

5. **Header con Tabs empuja todo hacia abajo**: El header con tabs y botones de acción bulk ocupa ~60px adicionales.

6. **Espaciado excesivo**: `TabsContent` usa `space-y-6` (24px entre elementos), duplicando el espaciado ya presente en el padre.

### Estructura Actual (Altura Consumida)
```
AdminHeader:           48px
Page Header + Tabs:    ~60px
KPIs (4 cards):        ~90px
Search bar:            ~50px
Filter dropdowns:      ~40px
Active filters badges: ~30px (condicional)
Results count:         ~20px
Tabla:                 ~500-600px (limitada por max 800)
─────────────────────────────────
TOTAL:                 ~340px antes de la tabla
```

## Solución Propuesta

### Arquitectura de Layout Optimizada

```
AdminHeader:           48px (fijo, sin cambios)
Page Header + Tabs:    ~40px (compactado)
KPIs inline:           ~32px (una línea horizontal)
Filtros compactos:     ~44px (una sola línea)
Tabla:                 flex-1 (resto del viewport)
```

### Cambios por Archivo

#### 1. `LinearContactsManager.tsx` - Layout Principal

**Problema**: `space-y-6` y KPIs grandes empujan la tabla hacia abajo.

**Cambios**:
- Reducir `space-y-6` a `space-y-2` en el contenedor principal
- Convertir KPIs a una barra horizontal compacta (inline)
- Eliminar `space-y-6 mt-0` de `TabsContent`
- Usar estructura flex-col con la tabla en `flex-1`

#### 2. `LinearContactsTable.tsx` - Tabla Virtualizada

**Problema**: Altura máxima fija de 800px y no ocupa el espacio disponible.

**Cambios**:
- Eliminar el `Math.min(availableHeight, 800)` (línea 365)
- Cambiar cálculo de altura: usar `calc(100vh - offsetTop - footerMargin)`
- Aumentar la altura mínima de 300 a algo más razonable
- Reducir `ROW_HEIGHT` de 44 a 40 para más densidad

#### 3. `LinearFilterBar.tsx` - Barra de Filtros

**Problema**: Múltiples líneas de filtros con espaciado excesivo.

**Cambios**:
- Reducir `space-y-3` a `space-y-1`
- Colapsar search + dropdowns en una sola línea con `flex-wrap`
- Mover badges de filtros activos inline con los dropdowns
- Reducir altura de botones de `h-8` a `h-7`

#### 4. Nuevo: `CompactStatsBar.tsx` - KPIs Inline

**Problema**: Los KPIs actuales son cards grandes que ocupan mucha altura.

**Solución**: Crear un componente compacto que muestre los 4 valores en una sola línea horizontal con un estilo tipo "pill/badge".

### Estructura Final del Layout

```tsx
<div className="h-[calc(100vh-48px-16px)] flex flex-col">
  {/* Header compacto: ~40px */}
  <div className="flex items-center justify-between shrink-0">
    <h1 + Tabs />
    <Actions />
  </div>
  
  {/* Stats inline: ~32px */}
  <CompactStatsBar total={} valuations={} unique={} qualified={} />
  
  {/* Filtros compactos: ~44px */}
  <LinearFilterBar />
  
  {/* Tabla: flex-1 ocupa todo el resto */}
  <div className="flex-1 min-h-0">
    <LinearContactsTable />
  </div>
</div>
```

## Sección Tecnica

### Modificaciones Detalladas

#### `src/components/admin/contacts/LinearContactsManager.tsx`

```typescript
// Línea 187: Cambiar className del Tabs container
<Tabs 
  value={activeTab} 
  onValueChange={...} 
  className="h-[calc(100vh-48px-32px)] flex flex-col"  // Altura fija, flex column
>

// Líneas 189-217: Compactar header
<div className="flex items-center justify-between shrink-0 pb-2">
  <div className="flex items-center gap-3">
    <h1 className="text-lg font-semibold">Leads</h1>
    <TabsList className="h-7">
      <TabsTrigger className="text-[11px] px-2 h-5 gap-1" />
    </TabsList>
  </div>
</div>

// Líneas 331-350: Reemplazar KPIs cards por stats inline
<div className="flex items-center gap-3 px-1 shrink-0 text-xs">
  <span className="text-muted-foreground">Total: <b>{stats.total}</b></span>
  <span className="text-muted-foreground/50">|</span>
  <span className="text-emerald-600">Valoraciones: <b>{stats.byOrigin.valuation}</b></span>
  <span className="text-muted-foreground/50">|</span>
  <span className="text-blue-600">Únicos: <b>{stats.uniqueContacts}</b></span>
  <span className="text-muted-foreground/50">|</span>
  <span className="text-amber-600">Calificados: <b>{stats.qualified}</b></span>
</div>

// TabsContent: usar flex-1 y space-y-1
<TabsContent value="directory" className="flex-1 flex flex-col space-y-1 min-h-0 mt-0">
  {/* Stats inline */}
  <CompactStatsBar stats={stats} />
  
  {/* Filtros compactos */}
  <LinearFilterBar {...props} />
  
  {/* Tabla con flex-1 */}
  <div className="flex-1 min-h-0">
    <LinearContactsTable {...props} />
  </div>
</TabsContent>
```

#### `src/components/admin/contacts/LinearContactsTable.tsx`

```typescript
// Línea 55: Reducir altura de fila
const ROW_HEIGHT = 40;  // Era 44

// Líneas 359-366: Nuevo cálculo de altura sin límite artificial
useEffect(() => {
  const updateHeight = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Sin límite máximo, ocupar todo el espacio disponible
      const availableHeight = window.innerHeight - rect.top - 16; // 16px padding bottom
      setListHeight(Math.max(200, availableHeight));
    }
  };
  
  updateHeight();
  window.addEventListener('resize', updateHeight);
  return () => window.removeEventListener('resize', updateHeight);
}, []);
```

#### `src/components/admin/contacts/LinearFilterBar.tsx`

```typescript
// Línea 290-291: Compactar espaciado
<div className="space-y-1">

// Línea 300: Una sola línea para todos los filtros
<div className="flex items-center gap-1.5 flex-wrap">
  {/* Todos los dropdowns con h-7 en lugar de h-8 */}
  <Button size="sm" className="h-7 text-xs">
  
// Líneas 754-776: Compactar las acciones
<div className="flex items-center gap-2 ml-auto shrink-0">
  <Button size="sm" className="h-7 text-xs">
```

### Anchos de Columna Optimizados

Los anchos actuales en `COLUMN_WIDTHS` suman 1284px. Se pueden ajustar para balance:

```typescript
export const COLUMN_WIDTHS: Record<string, number> = {
  star: 32,      // Era 36
  checkbox: 36,  // Era 40
  contact: 170,  // Era 180
  origin: 80,    // Era 90 (F. Registro)
  channel: 120,  // Era 130
  company: 140,  // Era 150
  province: 70,  // Era 80
  sector: 90,    // Era 100
  status: 110,   // Era 120
  revenue: 70,   // Era 75
  ebitda: 70,    // Era 75
  apollo: 75,    // Era 80
  date: 75,      // Era 85
  actions: 40,   // Era 44
};
// Total: ~1178px (más compacto)
```

### Resultado Visual Esperado

**Antes**:
- ~15-18 filas visibles sin scroll
- Mucho espacio visual "desperdiciado"
- Sensación de herramienta decorativa

**Después**:
- ~25-30 filas visibles sin scroll (dependiendo de resolución)
- Layout denso y profesional tipo Linear/Notion
- La tabla domina visualmente la pantalla
- Scroll contenido solo dentro de la tabla

### Orden de Implementación

1. Modificar `LinearContactsTable.tsx` (altura dinámica sin límite)
2. Crear componente `CompactStatsBar.tsx`
3. Modificar `LinearContactsManager.tsx` (layout flex-col)
4. Modificar `LinearFilterBar.tsx` (compactar a una línea)
5. Ajustar anchos de columna si es necesario
