

## Añadir columna de Notas en DocumentSendStep (campañas documento PDF)

### Problema
En las campañas de tipo "documento PDF", el paso de Envío (`DocumentSendStep`) no tiene la columna de notas que sí existe en el paso equivalente de las campañas de valoración (`CampaignSummaryStep`). El campo `seguimiento_notas` ya existe en la tabla y el modelo de datos.

### Cambios

**Archivo: `src/components/admin/campanas-valoracion/steps/DocumentSendStep.tsx`**

1. **Añadir imports**: `Textarea`, `Popover/PopoverContent/PopoverTrigger`, `MessageCircle`

2. **Copiar el componente `NotasPopover`** desde `CampaignSummaryStep` (líneas 122-175) — mismo popover que guarda `seguimiento_notas` en `valuation_campaign_companies`

3. **Añadir `<TableHead>` de Notas** (línea ~486, después de "Seguimiento"):
   ```tsx
   <TableHead className="text-center w-[40px]">Notas</TableHead>
   ```

4. **Añadir `<TableCell>` con `NotasPopover`** (línea ~526, después del `SeguimientoBadge`):
   ```tsx
   <TableCell className="text-center">
     <NotasPopover company={c} campaignId={campaignId} />
   </TableCell>
   ```

### Resultado
Cada empresa en el paso de envío de campañas documento tendrá el mismo icono de burbuja de notas que las campañas de valoración, permitiendo escribir y guardar notas por empresa.

