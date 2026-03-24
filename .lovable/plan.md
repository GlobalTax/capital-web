

## Ocultar Valoración en campañas de tipo Documento PDF

### Problema
En las campañas de tipo "Documento PDF", aparecen columnas y filtros de "Valoración" que no tienen sentido porque no se envía ninguna valoración — solo un documento PDF.

### Cambios

**1. `src/components/admin/campanas-valoracion/steps/FollowUpStep.tsx`**

El componente ya recibe `campaign` con `campaign_type`. Usar `const isDocument = campaign.campaign_type === 'document'` para:

- **Filtro**: Ocultar `<FinancialFilter label="Valoración" ...>` cuando `isDocument`
- **Columna header**: Ocultar `<TableHead>` de Valoración cuando `isDocument`
- **Columna datos**: Ocultar `<TableCell>` de `valuation_central` cuando `isDocument`
- **Lógica de filtrado**: No aplicar `matchesCustomRange(c.valuation_central, filterValuation)` cuando `isDocument`
- **hasFinancialFilters**: Excluir valuation del cálculo cuando `isDocument`

**2. `src/components/admin/campanas-valoracion/steps/CampaignAnalyticsStep.tsx`**

Recibe `campaign` prop. Mismo patrón `isDocument`:

- Ocultar `<TableHead>Valoración</TableHead>` y su `<TableCell>` correspondiente cuando `isDocument`

**3. `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx`**

Aunque las campañas documento usan `DocumentSendStep` en vez de `ProcessSendStep`, este componente también debería protegerse por consistencia:

- Ocultar columna Valoración, filtro y "PDF Valoración" cuando `isDocument`

### Resultado
En campañas de documento PDF, la tabla solo mostrará Facturación y EBITDA como datos financieros, sin ninguna referencia a Valoración.

