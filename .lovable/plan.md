

## Analisis: Duplicar Campañas de Valoracion Outbound

### Estado actual

La pagina `/admin/campanas-valoracion` (tabla `valuation_campaigns`) **no tiene funcionalidad de duplicar**. Solo hay botones de Editar y Eliminar.

Existe un `duplicateCampaign` en `useCampaignRegistry.ts`, pero ese pertenece al sistema de **Registry de campañas de marketing** (tabla `campaigns`), no al sistema de valoracion outbound.

### Datos involucrados en una campaña outbound

Una campaña outbound tiene 3 capas de datos:

```text
valuation_campaigns          ← Config: sector, multiples, advisor, templates
  └─ valuation_campaign_companies  ← Empresas: datos financieros, AI strengths/weaknesses, status
       └─ campaign_presentations   ← PDFs: valoraciones y estudios subidos
```

### Estrategia de duplicacion

**Duplicar solo la configuracion** (no las empresas ni presentaciones):
- Copia todos los campos de `valuation_campaigns` excepto `id`, timestamps y contadores
- Nombre: `"{original.name} (copia)"`
- Status: `draft` (siempre empieza como borrador)
- Contadores reseteados: `total_companies=0`, `total_sent=0`, `total_errors=0`, `total_valuation=0`

Las empresas y presentaciones NO se copian porque:
1. Las empresas tienen estados de envio (`sent`, `failed`) que no tienen sentido en una copia
2. Los PDFs generados son especificos de cada valoracion
3. El flujo natural es: duplicar config → importar nuevo Excel de empresas → procesar

### Cambios necesarios

**1. `src/hooks/useCampaigns.ts`** — Añadir mutation `duplicateCampaign`:
- Leer la campaña original por ID
- Insertar nueva fila copiando: `name`, `sector`, `valuation_type`, `custom_multiple`, `multiple_low`, `multiple_high`, `valuation_context`, `strengths_template`, `weaknesses_template`, `comparables_text`, `include_comparables`, `ai_personalize`, `advisor_*`, `use_custom_advisor`, `lead_source`, `service_type`, `financial_years`, `years_mode`
- Resetear contadores a 0, status a `draft`
- Navegar a la nueva campaña

**2. `src/pages/admin/CampanasValoracion.tsx`** — Añadir boton Duplicar:
- Icono `Copy` en la columna de acciones junto a Editar/Eliminar
- Click duplica y navega a `/admin/campanas-valoracion/{newId}`

### Alcance
- Sin migraciones de DB (usa tablas existentes)
- Solo 2 archivos modificados
- Funcionalidad simple y predecible

