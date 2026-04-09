

## Plan: Actualizar etapas del pipeline de Compras

### Cambios

**1. Migración SQL — Reemplazar etapas del pipeline de compras**

Eliminar las 5 etapas actuales (`nuevo`, `contactando`, `negociacion`, `ganado`, `perdido`) e insertar las 8 nuevas:

| Pos | Key | Label | Color | Icono |
|-----|-----|-------|-------|-------|
| 0 | `nuevo` | Nuevo | Azul (#3B82F6) | UserPlus |
| 1 | `contactado_nr` | Contactado - NR | Amarillo (#F59E0B) | PhoneMissed |
| 2 | `contacto_efectivo` | Contacto Efectivo | Verde (#10B981) | PhoneCall |
| 3 | `reunion_programada` | Reunión Programada | Violeta (#8B5CF6) | Calendar |
| 4 | `no_interesa` | No Interesa | Rojo (#EF4444) | XCircle |
| 5 | `capital_riesgo` | Capital Riesgo | Índigo (#6366F1) | TrendingUp |
| 6 | `search_fund` | Search Fund | Teal (#14B8A6) | Search |
| 7 | `corporativo` | Corporativo | Slate (#475569) | Building2 |

**2. Sin cambios de código** — Las etapas se cargan dinámicamente desde `contact_statuses`, por lo que la UI se actualizará automáticamente.

### Detalle técnico

Una migración SQL que:
1. `DELETE FROM contact_statuses WHERE pipeline_type = 'buy'`
2. `INSERT` de las 8 nuevas etapas con `pipeline_type = 'buy'`

### Archivos afectados
- Nueva migración SQL (único cambio)

