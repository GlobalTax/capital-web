

## Plan: Conectar datos de ads_costs_history con la tabla de Control de Costes

### Problema

La tabla "Registro de Campanas" (`CampaignRegistryTable`) busca snapshots en la tabla `campaign_cost_snapshots`, que esta vacia. Sin embargo, los datos reales de costes estan en `ads_costs_history` (321 registros con spend, results, campaign_name, etc.).

Las campanas en `campaigns` tienen un campo `external_name` que coincide con `campaign_name` de `ads_costs_history`:

| campaigns.name | campaigns.external_name | ads_costs_history.campaign_name |
|---|---|---|
| Q4-API | Valoracion de empresas Q4 - API + navegador | Valoracion de empresas Q4 - API + navegador |
| Valoracion | Generacion clientes potenciales (Valoracion) | Generacion clientes potenciales (Valoracion) |
| Compra | Generacion clientes potenciales - Compra | Generacion clientes potenciales - Compra |
| Venta | Generacion clientes potenciales - Venta | Generacion clientes potenciales - Venta |

### Solucion

Modificar el hook `useCampaignRegistry` para que, cuando una campana no tenga snapshot en `campaign_cost_snapshots`, busque el ultimo registro en `ads_costs_history` usando el `external_name` de la campana.

---

### Paso 1: Modificar query principal en useCampaignRegistry.ts

En la funcion `queryFn` del query `campaigns_registry`:

1. Despues de obtener snapshots de `campaign_cost_snapshots`, identificar campanas sin snapshot
2. Para esas campanas, buscar el registro mas reciente en `ads_costs_history` filtrando por `campaign_name = external_name`
3. Mapear los campos de `ads_costs_history` (spend, results, date) al formato de `CampaignSnapshot` para que la tabla los muestre

```text
Flujo actual:
campaigns --> campaign_cost_snapshots --> UI (vacio)

Flujo propuesto:
campaigns --> campaign_cost_snapshots --> si hay datos --> UI
                                      --> si NO hay datos --> ads_costs_history (por external_name) --> UI
```

### Paso 2: Mapeo de campos

| ads_costs_history | CampaignSnapshot |
|---|---|
| spend | amount_spent |
| results | results |
| date | snapshot_date |
| (spend/results) | cost_per_result (calculado) |

Los campos `daily_budget`, `monthly_budget`, `target_cpl`, `internal_status`, `notes` se mostraran como null ya que no existen en `ads_costs_history`.

### Paso 3: Marcar datos como "solo lectura" desde historial

Anadir un flag `source: 'snapshot' | 'history'` al tipo para que la tabla pueda distinguir entre datos editables (snapshots propios) y datos de referencia (importados de ads history). Los datos de `ads_costs_history` se mostraran pero no seran editables inline (solo los snapshots lo son).

---

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/hooks/useCampaignRegistry.ts` | Anadir fallback a `ads_costs_history` cuando no hay snapshot; anadir campo `source` al tipo |
| `src/components/admin/campaigns/CampaignRegistryTable.tsx` | Respetar flag `source` para deshabilitar edicion en datos de historial |

### Notas tecnicas

- No se modifica la base de datos, solo logica de frontend
- La query a `ads_costs_history` filtra por `campaign_name` usando el `external_name` de cada campana
- Se mantiene la posibilidad de crear snapshots manuales que tendran prioridad sobre los datos importados
- El rendimiento es bueno: solo se hace la query adicional si hay campanas sin snapshot

