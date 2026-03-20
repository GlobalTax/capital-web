

## Incluir envíos manuales en las métricas KPI de "1r Envío"

### Problema

`sentCount` solo mira `company.status === 'sent'`, pero algunas empresas con emails registrados manualmente (o previamente) pueden tener status `'calculated'` o `'created'`. Las métricas no reflejan el track completo.

### Cambio en `CampaignSummaryStep.tsx`

**Línea ~294**: Cambiar el cálculo de `sentCount` para que considere TAMBIÉN las empresas que tienen un registro en `campaign_emails` (a través de `emailSentMap`):

```tsx
// Antes:
const sentCount = companies.filter(c => c.status === 'sent').length;

// Después:
const sentCount = companies.filter(c => 
  c.status === 'sent' || emailSentMap.has(c.id)
).length;
```

Esto captura:
- Empresas con status `'sent'` (envío normal vía outbound queue)  
- Empresas con un registro en `campaign_emails` (envío manual registrado, aunque su status no se actualizó)

### También corregir el build error

**`src/main.tsx` y `src/App.tsx`**: Los errores de `duplicate data-lov-id` son artefactos del tagger de Lovable, no del código fuente real. El source está limpio (verificado). Si persiste, se hará un touch mínimo (añadir un comentario) para forzar re-compilación limpia.

### Resultado

Los KPIs de "Enviadas" y "Tasa éxito" incluirán tanto los envíos automáticos como los registrados manualmente, dando el track completo.

