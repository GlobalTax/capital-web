

## Plan: Filtrar TODOS los KPIs por período de tiempo

### Problema actual
Solo los KPIs de emails (enviados, entregados, rebotados, abiertos) se filtran por fecha. Los KPIs del funnel (sin respuesta, interesados, reuniones, no interesados, contestados) y el de "Empresas" NO se filtran — siempre muestran el total global.

### Solución
Usar el campo `company_id` de `campaign_emails` para determinar qué empresas tuvieron emails enviados en el período seleccionado, y filtrar el funnel solo a esas empresas.

### Cambios en `OutboundSummaryDashboard.tsx`

1. **Incluir `company_id` en la query de emails** — añadir `company_id` al select de `campaign_emails`
2. **Construir un Set de company IDs activos en el período** — a partir de los emails filtrados por fecha, extraer los `company_id` únicos
3. **Filtrar `companies` (seguimiento) por ese Set** — solo contar el seguimiento_estado de empresas que tienen al menos un email en el período seleccionado
4. **Filtrar "Empresas" total** — contar empresas únicas del período en vez del `total_companies` estático de la campaña
5. **En la tabla de desglose**, actualizar también la columna "Empresas" para reflejar las del período

### Impacto
- ~15 líneas modificadas
- Sin nuevas queries a BD (solo se añade un campo al select existente)
- Todos los KPIs reaccionarán al filtro de tiempo de forma coherente

