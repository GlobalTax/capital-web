

# Plan: Dashboard de Errores de Calculadora

## Objetivo

Crear un dashboard en `/admin/calculator-errors` para monitorear errores de la calculadora de valoración desde la tabla `calculator_errors`, con filtros por tipo y fecha.

---

## Estructura de la Tabla (Existente)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único |
| `error_type` | TEXT | `calculation`, `submission`, `validation`, `network`, `unknown` |
| `error_message` | TEXT | Mensaje de error |
| `error_stack` | TEXT | Stack trace (opcional) |
| `component` | TEXT | Componente origen |
| `action` | TEXT | Acción que falló |
| `company_data` | JSONB | Datos del lead (email, nombre, empresa) |
| `current_step` | INTEGER | Paso donde ocurrió |
| `unique_token` | TEXT | Token de sesión |
| `source_project` | TEXT | Proyecto origen |
| `user_agent` | TEXT | Navegador/dispositivo |
| `ip_address` | INET | IP del usuario |
| `created_at` | TIMESTAMPTZ | Fecha del error |

---

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────┐
│                   /admin/calculator-errors                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    HEADER + FILTROS                         ││
│  │  [Fecha: Últimos 7d ▼]  [Tipo: Todos ▼]  [🔄 Refrescar]    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │  Total  │ │ Cálculo │ │  Red    │ │ Último  │               │
│  │ Errores │ │ Errors  │ │ Errors  │ │  Error  │               │
│  │   24    │ │   12    │ │    8    │ │  2h ago │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   TABLA DE ERRORES                          ││
│  │ Tipo | Mensaje | Componente | Lead | Fecha | Acciones       ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ 🔴 calculation | Failed to compute... | UnifiedCalc | ...   ││
│  │ 🟠 network     | Timeout connecting... | SaveHook | ...     ││
│  │ ...                                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Modal: Detalle del Error]                                     │
│    - Stack trace completo                                       │
│    - Datos del lead (recuperables)                              │
│    - User agent / dispositivo                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Crear

### 1. Hook: `useCalculatorErrors.ts`

**Ubicación:** `src/features/valuation/hooks/useCalculatorErrors.ts`

```typescript
// Hook para obtener errores de calculadora con filtros
export interface CalculatorErrorFilters {
  dateRange: '7d' | '30d' | '90d' | 'all';
  errorType: 'all' | 'calculation' | 'submission' | 'validation' | 'network' | 'unknown';
}

export interface CalculatorErrorStats {
  total: number;
  byType: Record<string, number>;
  lastError: string | null;
}

export const useCalculatorErrors = (filters: CalculatorErrorFilters) => {
  // Query errores desde calculator_errors
  // Calcular estadísticas agregadas
  // Retornar { data, stats, isLoading, refetch }
}
```

### 2. Página: `CalculatorErrorsPage.tsx`

**Ubicación:** `src/pages/admin/CalculatorErrorsPage.tsx`

Componentes:
- **Header**: Título + descripción + botón refrescar
- **Filtros**: Select de rango de fechas + Select de tipo de error
- **KPIs**: 4 tarjetas con métricas (total, por tipo, último error)
- **Tabla**: Lista de errores con columnas:
  - Tipo (badge coloreado)
  - Mensaje (truncado)
  - Componente
  - Lead (nombre/email si disponible)
  - Fecha
  - Acciones (ver detalle)
- **Modal de detalle**: Stack trace completo + datos del lead

### 3. Componentes Auxiliares

**`CalculatorErrorsKPIs.tsx`**
- 4 tarjetas con estadísticas
- Total errores, errores de cálculo, errores de red, tiempo desde último error

**`CalculatorErrorsTable.tsx`**
- Tabla con errores
- Badges coloreados por tipo
- Botón para ver detalle
- Datos del lead (si existen)

**`CalculatorErrorDetailModal.tsx`**
- Modal con detalle completo
- Stack trace en bloque de código
- Datos del lead con opción de "recuperar"
- Metadatos (user agent, IP, etc.)

---

## Cambios en Archivos Existentes

### 1. `AdminRouter.tsx`

Añadir ruta:
```typescript
const LazyCalculatorErrorsPage = lazy(() => import('@/pages/admin/CalculatorErrorsPage'));

// En Routes:
<Route path="/calculator-errors" element={<LazyCalculatorErrorsPage />} />
```

### 2. `LazyAdminComponents.tsx`

Añadir export:
```typescript
export const LazyCalculatorErrorsPage = lazy(() => import('@/pages/admin/CalculatorErrorsPage'));
```

### 3. Base de datos (Sidebar)

Añadir entrada en la tabla `sidebar_items` para que aparezca en el menú lateral bajo "Dashboard" o "Analytics".

---

## Diseño Visual

### Badges por Tipo de Error

| Tipo | Color | Icono |
|------|-------|-------|
| `calculation` | Rojo | AlertTriangle |
| `submission` | Naranja | Send |
| `validation` | Amarillo | AlertCircle |
| `network` | Azul | Wifi |
| `unknown` | Gris | HelpCircle |

### KPIs

| Métrica | Icono | Color |
|---------|-------|-------|
| Total Errores | Bug | Rojo |
| Errores Cálculo | Calculator | Naranja |
| Errores Red | Wifi | Azul |
| Último Error | Clock | Gris |

---

## Flujo de Datos

1. **Usuario accede** a `/admin/calculator-errors`
2. **Hook `useCalculatorErrors`** consulta Supabase con filtros
3. **Página** renderiza KPIs + tabla
4. **Filtros** actualizan query params → refetch automático
5. **Click en error** → Modal con detalle completo
6. **Datos del lead** disponibles para recuperación manual

---

## Funcionalidades Extra (Opcional)

- **Exportar CSV**: Botón para descargar errores
- **Marcar como resuelto**: Columna `resolved_at` para tracking
- **Notificaciones**: Alerta cuando hay nuevos errores críticos

---

## Sección Técnica

### Archivos a Crear

| Archivo | Tipo |
|---------|------|
| `src/features/valuation/hooks/useCalculatorErrors.ts` | Hook |
| `src/pages/admin/CalculatorErrorsPage.tsx` | Página |
| `src/pages/admin/components/CalculatorErrorsKPIs.tsx` | Componente |
| `src/pages/admin/components/CalculatorErrorsTable.tsx` | Componente |
| `src/pages/admin/components/CalculatorErrorDetailModal.tsx` | Componente |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/features/admin/components/AdminRouter.tsx` | Añadir ruta |
| `src/features/admin/components/LazyAdminComponents.tsx` | Añadir lazy export |

### Impacto

- **Archivos nuevos:** 5
- **Archivos modificados:** 2
- **Líneas estimadas:** ~400
- **Riesgo:** Bajo (solo lectura de datos existentes)

