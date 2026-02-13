

## Parametrizar los anos financieros en la configuracion de campana

### Resumen
Anadir un campo `financial_years` (array de numeros) a la campana para que el usuario defina en el Paso 1 que anos financieros quiere utilizar (ej: 2025, 2024, 2023). Actualmente estan hardcodeados como `currentYear - 1, -2, -3`.

### Cambios

#### 1. Base de datos: nueva columna
Crear migracion para anadir `financial_years` a `valuation_campaigns`:

```sql
ALTER TABLE valuation_campaigns 
ADD COLUMN financial_years INTEGER[] DEFAULT ARRAY[2025, 2024, 2023];
```

#### 2. Tipo TypeScript (`useCampaigns.ts`)
Anadir `financial_years: number[] | null` a la interfaz `ValuationCampaign`.

#### 3. Paso 1 - CampaignConfigStep
Anadir una seccion "Anos financieros" dentro de la tarjeta "Plantilla de Valoracion" con:
- 3 campos numericos (Ano 1, Ano 2, Ano 3) pre-rellenados con los valores por defecto (2025, 2024, 2023)
- El usuario puede cambiar cualquiera de los anos
- Se guardan como array en `financial_years`

#### 4. Paso 2 - CompaniesStep
- Recibir `financial_years` como prop (desde `CampanaValoracionForm`)
- Reemplazar las constantes `YEAR_1`, `YEAR_2`, `YEAR_3` por los valores de la prop
- La plantilla Excel usara los anos configurados en la campana
- El formulario manual mostrara los anos configurados
- El `COLUMN_MAP` se construira dinamicamente con esos anos

#### 5. Formulario principal (CampanaValoracionForm.tsx)
- Pasar `campaignData.financial_years` como prop a `CompaniesStep`:
  ```
  <CompaniesStep campaignId={campaignId} financialYears={campaignData.financial_years || [2025, 2024, 2023]} />
  ```

#### 6. Inicializacion por defecto
En `CampanaValoracionForm`, anadir `financial_years: [currentYear - 1, currentYear - 2, currentYear - 3]` al estado inicial de `campaignData`.

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| Nueva migracion SQL | Columna `financial_years INTEGER[]` |
| `src/integrations/supabase/types.ts` | Se regenera |
| `src/hooks/useCampaigns.ts` | Anadir `financial_years` al tipo |
| `src/pages/admin/CampanaValoracionForm.tsx` | Valor por defecto + pasar prop |
| `src/components/admin/campanas-valoracion/steps/CampaignConfigStep.tsx` | UI para seleccionar los 3 anos |
| `src/components/admin/campanas-valoracion/steps/CompaniesStep.tsx` | Recibir prop y usar anos dinamicos |

### Detalles tecnicos

- `buildColumnMap` pasara a recibir `[year1, year2, year3]` como parametro en lugar de usar constantes globales
- `emptyYearRow` seguira igual pero se llamara con los anos de la prop
- La plantilla Excel generara cabeceras con los anos correctos de la campana
- Compatibilidad: campanas existentes sin `financial_years` usaran el fallback `[2025, 2024, 2023]`

