
# Plan: Sincronizar empresas de campañas outbound a la tabla empresas

## Situación actual
- **797 empresas** en `valuation_campaign_companies` (596 nombres únicos)
- **73** ya existen en `empresas` (por CIF o nombre)
- **724** faltan — nunca se sincronizaron porque el trigger solo actúa en INSERTs nuevos
- El campo `origen` existe en `empresas` pero ninguna tiene valor `'outbound'`

## Plan

### Paso único: Ejecutar una query SQL de sincronización retroactiva

Ejecutar un bloque PL/pgSQL que recorra todas las `valuation_campaign_companies` y aplique la misma lógica del trigger existente (`sync_campaign_company_to_empresas`):

1. **Para empresas que ya existen** (match por CIF o nombre): actualizar datos financieros (`facturacion`, `revenue`, `ebitda`, `cif`, `sitio_web`, `ubicacion`) y marcar `origen = 'outbound'`, `source = 'outbound_campaign'`
2. **Para empresas nuevas**: insertar con todos los campos disponibles (`nombre`, `cif`, `facturacion`, `revenue`, `ebitda`, `sitio_web`, `ubicacion`, `origen`, `source`, `source_id`)
3. Usar deduplicación por `client_company` para evitar insertar duplicados (tomar la fila más reciente por empresa)

### Datos que se mapean

| `valuation_campaign_companies` | `empresas` |
|---|----|
| `client_company` | `nombre` |
| `client_cif` | `cif` |
| `revenue` | `facturacion` + `revenue` |
| `ebitda` | `ebitda` |
| `client_website` | `sitio_web` |
| `client_provincia` | `ubicacion` |
| `financial_year` | `año_datos_financieros` |
| — | `origen = 'outbound'` |
| — | `source = 'outbound_campaign'` |
| `campaign_id` | `source_id` |

### Archivos afectados
- Ninguno. Solo una operación SQL de datos (no schema).

### Resultado esperado
- ~596 empresas únicas sincronizadas (73 actualizadas + ~523 nuevas insertadas)
- Todas marcadas con `origen = 'outbound'`
- Tabla `empresas` pasará de ~3506 a ~4029 registros
