
# Plan: Corregir la Pestaña "Estadísticas" de Contactos

## Diagnóstico Completo

### Causas Raíz Identificadas

#### 1. Queries ILIKE Malformadas (Error 400)
En `useCampaignCosts.ts` (líneas 231-234 y 247-249), las queries usan el patrón incorrecto:
```typescript
utmValues.map(v => `utm_source.ilike.%${v}%`).join(',')
```

Esto genera filtros como `utm_source.ilike.%meta%` que, al ser codificados en URL, se convierten en `utm_source.ilike.%25meta%25`, causando que Supabase devuelva **error 400**.

La sintaxis correcta de Supabase PostgREST usa `*` como comodín, no `%`:
```typescript
utmValues.map(v => `utm_source.ilike.*${v}*`).join(',')
```

#### 2. Statement Timeouts en Postgres
Los logs de analytics muestran múltiples errores:
```
"canceling statement due to statement timeout"
```

Esto indica que las queries de agregación (`getLeadsByChannelAndPeriod`) tardan demasiado y son canceladas por el servidor.

#### 3. parseISO sin Protección en Evolución Temporal
En `useLeadMetrics.ts` línea 311, hay un `parseISO` que puede lanzar excepción si la fecha es inválida:
```typescript
const leadDate = format(parseISO(l.lead_received_at || l.created_at), 'yyyy-MM-dd');
```

Si cualquier lead tiene una fecha malformada, esto crashea el componente.

#### 4. Error Boundaries No Capturan Errores de Query
Los Error Boundaries de React solo capturan errores durante el **render**. Los errores que ocurren en las funciones `queryFn` de React Query no se propagan a los Error Boundaries, causando que el error se muestre como "Error inesperado" global.

---

## Solución Propuesta

### Cambio 1: Corregir Sintaxis ILIKE en useCampaignCosts.ts

**Archivo**: `src/hooks/useCampaignCosts.ts`

**Líneas 232-234** - Cambiar:
```typescript
// ANTES (incorrecto)
leadsQuery = leadsQuery.or(
  utmValues.map(v => `utm_source.ilike.%${v}%`).join(',')
);

// DESPUÉS (correcto)
leadsQuery = leadsQuery.or(
  utmValues.map(v => `utm_source.ilike.*${v}*`).join(',')
);
```

**Líneas 247-249** - Mismo cambio para `valuationsQuery`.

### Cambio 2: Proteger parseISO en useLeadMetrics.ts

**Archivo**: `src/components/admin/metrics/useLeadMetrics.ts`

**Líneas 309-322** - Envolver la evolución temporal con try/catch:
```typescript
const temporalEvolution: TemporalDataPoint[] = last30Days.map(dateStr => {
  const dayLeads = filteredLeads.filter(l => {
    try {
      const dateToCheck = l.lead_received_at || l.created_at;
      if (!dateToCheck) return false;
      const leadDate = format(parseISO(dateToCheck), 'yyyy-MM-dd');
      return leadDate === dateStr;
    } catch {
      return false; // Skip malformed dates
    }
  });
  // ... resto del código
});
```

### Cambio 3: Deshabilitar Query de Channel Analytics Problemática

**Archivo**: `src/hooks/useCampaignCosts.ts`

La función `getLeadsByChannelAndPeriod` hace 2 queries por cada uno de los 4 canales = 8 queries adicionales. Esto es lento y causa timeouts.

**Solución temporal**: Marcar `enabled: false` en la query `campaign_costs_analytics` mientras se optimiza, o simplificar la lógica para no usar ILIKE:

```typescript
// Líneas 261-316 - Deshabilitar temporalmente
const { data: channelAnalytics = [], isLoading: isLoadingAnalytics } = useQuery({
  queryKey: ['campaign_costs_analytics', costs],
  queryFn: async () => {
    // ... código existente
  },
  enabled: false, // TEMPORAL: Deshabilitar hasta optimizar
  staleTime: 1000 * 60 * 5, // 5 minutos
});
```

O mejor aún, simplificar para no depender de filtros ILIKE costosos en tiempo real.

### Cambio 4: Añadir ErrorBoundary con Fallback para Errores de Query

Los Error Boundaries actuales no capturan errores asíncronos. Necesitamos usar el patrón de React Query `throwOnError` combinado con Error Boundaries.

**Archivo**: `src/components/admin/campaigns/AnalyticsTabs.tsx`

Añadir manejo de errores explícito:
```typescript
const {
  isLoading,
  error, // Añadir
  // ... resto
} = useCampaignHistory(period, campaignFilter);

// Mostrar fallback si hay error
if (error) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-amber-500 mb-4" />
        <p className="text-muted-foreground">
          No se pudieron cargar los datos de análisis.
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
          Reintentar
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Cambio 5: Proteger CampaignRegistryTable y MetaAdsAnalyticsDashboard

Verificar que estos componentes manejan correctamente el estado de error de sus queries internas.

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useCampaignCosts.ts` | Corregir `%` → `*` en ILIKE + deshabilitar query pesada |
| `src/components/admin/metrics/useLeadMetrics.ts` | Envolver parseISO en try/catch en evolución temporal |
| `src/components/admin/campaigns/AnalyticsTabs.tsx` | Añadir manejo explícito de error con fallback UI |
| `src/hooks/useCampaignHistory.ts` | (Opcional) Añadir retry: 1 y staleTime para resiliencia |

---

## Flujo de Corrección

```text
┌─────────────────────────────────────────────────────────────────┐
│              ANTES (Estado Actual)                               │
├─────────────────────────────────────────────────────────────────┤
│  1. Usuario entra en Estadísticas                                │
│  2. useCampaignCosts lanza 8 queries ILIKE con %                │
│  3. Supabase devuelve 400 (URL malformada)                      │
│  4. Error no capturado → Crash global                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              DESPUÉS (Estado Corregido)                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Usuario entra en Estadísticas                                │
│  2. Queries ILIKE usan * (correcto)                             │
│  3. Query pesada deshabilitada o optimizada                      │
│  4. parseISO protegido con try/catch                            │
│  5. Componentes manejan error con fallback UI                    │
│  6. Error Boundaries capturan cualquier crash residual          │
│  7. Vista estable, nunca crash global                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Verificación Post-Implementación

1. **Entrar en `/admin/contacts` → click "Estadísticas"** → NO debe mostrar error global
2. **Cambiar entre tabs** (Control de Costes / Meta Ads / Google Ads / Métricas) → Cada uno funciona independiente
3. **Si un tab tiene error** → Muestra fallback "No se pudo cargar" con botón reintentar
4. **Consola del navegador** → Sin errores 400
5. **Probar con dataset grande** → Sin timeout visible al usuario
6. **Probar filtros de fecha** → Funciona sin crashear

---

## Notas Técnicas

- **No se modifica la base de datos**: Solo cambios en frontend/hooks
- **Cambio mínimo e incremental**: Solo se tocan las líneas problemáticas
- **Compatible con Error Boundaries existentes**: Se complementan, no se reemplazan
- **Retrocompatible**: No afecta otras funcionalidades del admin
- **Impacto en performance**: Deshabilitar la query pesada mejora tiempos de carga
