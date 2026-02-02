
# Plan: Arreglar la pestaña "Estadísticas" de Contactos

## Diagnóstico Realizado

### Causa Raíz Identificada
Los logs de Postgres muestran errores de **statement timeout** - las queries están tardando más de lo permitido y son canceladas por el servidor. Esto causa que los componentes reciban errores en lugar de datos, y al no haber Error Boundaries individuales, **un error en cualquier sección tumba toda la vista**.

### Componentes Afectados
1. **ContactsStatsPanel** - Panel principal que orquesta todas las sub-secciones
2. **useContactsCostAnalysis** - Hook que hace cálculos pesados en frontend
3. **useLeadMetrics** - Hace 4 queries paralelas sin límites
4. **useCampaignHistory** - Consulta histórico de campañas
5. **MetaAdsAnalyticsDashboard** - Carga todo el histórico de ads

---

## Arquitectura de la Solución

### Estrategia de 3 Capas

```text
┌─────────────────────────────────────────────────────┐
│        ContactsStatsPanel (Orquestador)             │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ ErrorBoundary│ │ ErrorBoundary│ │ ErrorBoundary│ │
│  │ + Suspense  │ │ + Suspense  │ │ + Suspense  │   │
│  ├─────────────┤ ├─────────────┤ ├─────────────┤   │
│  │ Control de  │ │   Meta Ads  │ │   Métricas  │   │
│  │   Costes    │ │  Analytics  │ │   Leads     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Cambios Técnicos

### 1. Crear StatsErrorBoundary (Nuevo Componente)

**Archivo**: `src/features/contacts/components/stats/StatsErrorBoundary.tsx`

Un Error Boundary reutilizable para cada sección de estadísticas:
- Captura errores de renderizado
- Muestra un fallback amigable con botón "Reintentar"
- Registra el error en consola
- No afecta a otras secciones

### 2. Modificar ContactsStatsPanel

**Archivo**: `src/features/contacts/components/stats/ContactsStatsPanel.tsx`

Envolver cada `TabsContent` con un Error Boundary individual:

```typescript
<TabsContent value="costs">
  <StatsErrorBoundary section="Control de Costes">
    <CampaignRegistryTable />
    <AnalyticsTabs />
  </StatsErrorBoundary>
</TabsContent>

<TabsContent value="meta_ads">
  <StatsErrorBoundary section="Meta Ads">
    <MetaAdsAnalyticsDashboard />
  </StatsErrorBoundary>
</TabsContent>

// ... igual para cada tab
```

### 3. Proteger Hook useLeadMetrics

**Archivo**: `src/components/admin/metrics/useLeadMetrics.ts`

Añadir defensas:
- Normalizar arrays: `const allLeads = data ?? []`
- Añadir límites a queries: `.limit(5000)`
- Proteger cálculos de divisiones por cero
- Envolver parseISO con try/catch
- Añadir retry con backoff

```typescript
const { data: valuations } = await supabase
  .from('company_valuations')
  .select('id, lead_status_crm, created_at, lead_received_at, lead_form')
  .is('is_deleted', false)
  .order('created_at', { ascending: false })
  .limit(5000);  // Límite para evitar timeouts

// Normalización segura
if (valuations) {
  allLeads.push(...(valuations ?? []).map(v => ({...})));
}
```

### 4. Proteger Hook useContactsCostAnalysis

**Archivo**: `src/features/contacts/hooks/useContactsCostAnalysis.ts`

Añadir defensas:
- Verificar que `allContacts` existe antes de filtrar
- Proteger reduce/map con valores por defecto
- Evitar divisiones por cero en métricas

```typescript
const filteredContacts = useMemo(() => {
  if (!allContacts || !Array.isArray(allContacts)) return [];
  // ... resto del código
}, [allContacts, ...]);

const cpl = totalLeads > 0 ? totalCost / totalLeads : 0;
```

### 5. Proteger Componentes de Gráficos

**Archivos afectados**:
- `EvolutionCharts.tsx`
- `TemporalEvolutionBlock.tsx`
- `StatusDistributionBlock.tsx`
- `ConversionFunnelBlock.tsx`

Para cada uno:
- Verificar `data.length > 0` antes de renderizar
- Envolver parseISO en try/catch
- Añadir fallback para datos vacíos o inválidos

```typescript
const chartData = data.map(d => {
  try {
    return {
      ...d,
      displayDate: format(parseISO(d.date), 'dd MMM', { locale: es }),
    };
  } catch {
    return { ...d, displayDate: d.date || '—' };
  }
});
```

### 6. Optimizar Queries con Límites

**Hook useCampaignHistory** (`src/hooks/useCampaignHistory.ts`):
- Ya tiene `.limit(1000)` ✓ - pero verificar que maneja error

**Hook useAdsCostsHistory** (`src/hooks/useAdsCostsHistory.ts`):
- Añadir `.limit(2000)` para evitar cargar todo el histórico

---

## Archivos a Crear/Modificar

| Archivo | Acción | Cambios |
|---------|--------|---------|
| `src/features/contacts/components/stats/StatsErrorBoundary.tsx` | **Crear** | Error Boundary reutilizable con UI de fallback |
| `src/features/contacts/components/stats/ContactsStatsPanel.tsx` | Modificar | Envolver cada tab con StatsErrorBoundary |
| `src/components/admin/metrics/useLeadMetrics.ts` | Modificar | Añadir límites, normalización y try/catch |
| `src/features/contacts/hooks/useContactsCostAnalysis.ts` | Modificar | Añadir verificaciones null/undefined |
| `src/components/admin/campaigns/MetaAdsAnalytics/EvolutionCharts.tsx` | Modificar | Proteger parseISO |
| `src/components/admin/metrics/TemporalEvolutionBlock.tsx` | Modificar | Proteger parseISO |
| `src/hooks/useAdsCostsHistory.ts` | Modificar | Añadir límite a query |

---

## Pruebas de Verificación

Después de implementar:

1. **Entrar en `/admin/contacts` → click "Estadísticas"** → No debe mostrar error
2. **Cambiar entre tabs** (Control de Costes / Meta Ads / Google Ads / Métricas) → Cada uno carga independiente
3. **Probar con rango de fechas vacío** → Muestra empty state, no rompe
4. **Simular fallo de una query** (desconectar red brevemente) → Solo falla ese bloque, muestra "Reintentar"
5. **Refrescar página** → Sigue funcionando

---

## Resultado Esperado

- ✅ "Estadísticas" siempre navegable (nunca pantalla de error global)
- ✅ Errores aislados por sección (un bloque falla, los demás funcionan)
- ✅ Mensajes de error claros con opción de reintentar
- ✅ Queries optimizadas con límites para evitar timeouts
- ✅ Cálculos robustos sin NaN/undefined/Infinity
- ✅ Tabs "Todos", "Favoritos", "Pipeline" no afectados
