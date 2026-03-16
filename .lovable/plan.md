

## Plan: Integración directa Lista de Contacto → Campaña Outbound

### Contexto actual
- Las listas de contacto (`outbound_lists` / `outbound_list_companies`) y las campañas outbound (`valuation_campaigns` / `valuation_campaign_companies`) son sistemas independientes.
- Existe una tabla puente `outbound_list_campaigns` para vincular manualmente lista↔campaña, pero solo registra metadata — no mueve empresas.
- Las empresas se añaden a campañas vía Excel o manualmente en el paso 2 (CompaniesStep).
- No hay protección contra enviar emails duplicados a empresas que ya existen en otra campaña.

### Solución: Botón "Enviar a campaña" con deduplicación

#### 1. Migración SQL
Añadir columna `source_list_id` a `valuation_campaigns` para trazar rápidamente qué lista alimentó cada campaña:

```sql
ALTER TABLE valuation_campaigns 
  ADD COLUMN source_list_id uuid REFERENCES outbound_lists(id) ON DELETE SET NULL;
```

#### 2. ContactListDetailPage — Botón "Enviar a campaña Outbound"
En la toolbar de la lista, añadir un botón que:
- Abre un diálogo con dos opciones: **Crear nueva campaña** o **Añadir a campaña existente**
- Muestra las empresas seleccionadas (o todas si no hay selección)
- **Deduplicación**: Antes de insertar, consulta `valuation_campaign_companies` por `client_cif` en la campaña destino. Muestra un resumen:
  - X empresas nuevas (se añadirán)
  - Y empresas ya existentes en la campaña (se omitirán)
  - Z empresas ya contactadas en OTRAS campañas (aviso, pero permite continuar)
- Al confirmar: inserta en `valuation_campaign_companies` mapeando campos (`empresa→client_company`, `cif→client_cif`, `email→client_email`, `facturacion→revenue`, `ebitda→ebitda`, etc.)
- Registra el vínculo en `outbound_list_campaigns`
- Si crea nueva campaña, setea `source_list_id`

#### 3. CompaniesStep — Botón "Importar desde lista"
En el paso 2 de la campaña, añadir un botón que:
- Abre un selector de listas (`outbound_lists`)
- Muestra las empresas de la lista seleccionada
- Aplica la misma deduplicación por CIF contra la campaña actual
- Inserta las empresas nuevas y registra `source_list_id` si la campaña no tenía uno

#### 4. Visibilidad en Campañas — Lista origen
- **CampanasValoracion.tsx** (listado): Mostrar badge/link con el nombre de la lista origen junto al nombre de la campaña (query join con `outbound_lists` via `source_list_id`)
- **CampaignConfigStep**: Mostrar la lista origen como info de solo lectura si existe
- **CampanaValoracionForm header**: Mostrar link a la lista origen

#### 5. Deduplicación cross-campaña (protección anti-duplicados)
En el diálogo de envío, consultar `valuation_campaign_companies` filtrando por los CIFs de las empresas a enviar, agrupando por `campaign_id`. Mostrar aviso tipo:
> "3 empresas ya fueron contactadas en la campaña 'Sector Industrial Q1'. ¿Deseas incluirlas igualmente?"

Con checkbox para excluirlas individualmente.

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| **Migración SQL** | `source_list_id` en `valuation_campaigns` |
| `src/hooks/useCampaigns.ts` | Añadir `source_list_id` al tipo `ValuationCampaign` |
| `src/pages/admin/ContactListDetailPage.tsx` | Botón "Enviar a campaña" + diálogo con deduplicación + mapeo de campos |
| `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` | Botón "Importar desde lista" + selector + deduplicación |
| `src/pages/admin/CampanasValoracion.tsx` | Mostrar badge con lista origen en el listado |
| `src/hooks/useContactLists.ts` | Helper para mapear campos lista→campaña |

### Mapeo de campos lista → campaña

```text
outbound_list_companies    →  valuation_campaign_companies
─────────────────────────     ──────────────────────────────
empresa                    →  client_company
contacto                   →  client_name
email                      →  client_email
telefono                   →  client_phone
cif                        →  client_cif
web                        →  client_website
provincia                  →  client_provincia
facturacion                →  revenue
ebitda                     →  ebitda
```

### Flujo de deduplicación

```text
1. Usuario selecciona empresas en lista
2. Click "Enviar a campaña"
3. Sistema consulta CIFs en campaña destino → duplicados internos
4. Sistema consulta CIFs en TODAS las campañas → duplicados cross
5. Muestra resumen:
   ┌─────────────────────────────────────────┐
   │ 45 empresas seleccionadas               │
   │ ✓ 38 nuevas — se añadirán               │
   │ ⚠ 4 ya en esta campaña — se omitirán    │
   │ ⚠ 3 contactadas en otras campañas       │
   │   □ Excluir contactadas previamente      │
   └─────────────────────────────────────────┘
6. Confirmar → insert batch
```

