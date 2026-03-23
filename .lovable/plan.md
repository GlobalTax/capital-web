

## Añadir fecha de inicio de envío en la vista general de campañas

### Qué cambia

Se añade una columna "1r Envío" junto a la columna "Fecha" (creación) que muestra la fecha del primer email enviado en cada campaña.

### Cambios técnicos

**Archivo: `src/pages/admin/CampanasValoracion.tsx`**

1. **Ampliar la query de `stageData`** (línea ~81): Añadir `sent_at` al select de `campaign_emails` y calcular `firstSentAt` (el `MIN(sent_at)`) por campaña en el bucle de procesamiento. El tipo pasa a `{ emailsSent: number; maxFollowup: number; firstSentAt: string | null }`.

2. **Columna en headers** (líneas ~525 y ~564): Añadir `<TableHead>1r Envío</TableHead>` después de la columna "Fecha".

3. **Celda en `renderCampaignRow`** (línea ~331): Después de la celda de `created_at`, añadir:
   ```tsx
   <TableCell className="text-sm text-muted-foreground">
     {stageData?.[c.id]?.firstSentAt
       ? new Date(stageData[c.id].firstSentAt).toLocaleDateString('es-ES')
       : '—'}
   </TableCell>
   ```

4. **Header de vista plana** (línea ~525): Mismo cambio para la tabla sin carpetas.

