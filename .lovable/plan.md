
## Sistema de seguimiento post-envio para campanas Outbound

### Problema actual
El flujo de una empresa en una campana outbound termina en el estado "Enviado" (sent). No existe manera de registrar interacciones posteriores como: segundo correo, llamada de seguimiento, respuesta del cliente, reunion, etc.

### Solucion propuesta
Crear una tabla `campaign_company_interactions` para registrar el historial de seguimientos por empresa, y anadir una columna `follow_up_status` a `valuation_campaign_companies` para reflejar el estado comercial actual.

### Cambios en base de datos

1. **Nueva tabla `campaign_company_interactions`**:
   - `id` (UUID, PK)
   - `campaign_company_id` (FK a valuation_campaign_companies)
   - `tipo`: tipo de interaccion (email_followup, llamada, whatsapp, reunion, respuesta_cliente, nota)
   - `titulo`: descripcion breve (ej: "2o correo enviado", "Llamada - no contesta")
   - `descripcion`: notas opcionales
   - `resultado`: positivo, neutral, negativo, sin_respuesta
   - `fecha`: timestamp de la interaccion
   - `created_by`: usuario que registra
   - `created_at`: auto

2. **Nueva columna en `valuation_campaign_companies`**:
   - `follow_up_status`: estado comercial post-envio (sent, followup_1, followup_2, contacted, interested, not_interested, meeting_scheduled, closed)
   - `follow_up_count`: numero de seguimientos realizados (integer, default 0)
   - `last_interaction_at`: fecha de ultima interaccion

3. **RLS**: Politicas para usuarios autenticados (lectura y escritura vinculadas a auth.uid())

### Cambios en frontend

1. **Nuevo componente `CampaignCompanyInteractions`**:
   - Timeline de interacciones similar al existente en mandatos/empresas
   - Dialogo para anadir nueva interaccion con selector de tipo y resultado
   - Boton de eliminar interaccion

2. **Modificaciones en `ProcessSendStep.tsx`**:
   - En la tabla de resultados, mostrar el `follow_up_status` junto al estado base
   - En el dropdown de acciones (MoreVertical), anadir opcion "Registrar seguimiento" que abre el dialogo
   - Nuevos filtros: por follow_up_status

3. **Modificaciones en `CampaignSummaryStep.tsx`**:
   - Nuevos KPIs: seguimientos realizados, tasa de respuesta, reuniones agendadas
   - Columna adicional en la tabla resumen con el estado de seguimiento

4. **Hook `useCampaignCompanyInteractions`**:
   - Query para listar interacciones de una empresa
   - Mutacion para crear interaccion (+ actualizar follow_up_count y last_interaction_at)
   - Mutacion para eliminar

### Detalle tecnico

```text
valuation_campaign_companies
+------------------+     +--------------------------------+
| id               |---->| campaign_company_interactions   |
| status (sent)    |     | campaign_company_id (FK)        |
| follow_up_status |     | tipo (email_followup, llamada..) |
| follow_up_count  |     | titulo                          |
| last_interaction |     | resultado                       |
+------------------+     | fecha                           |
                          +--------------------------------+
```

### Flujo de usuario
1. Empresa se envia (status = sent) -- esto ya existe
2. Usuario abre el dropdown de la empresa y selecciona "Registrar seguimiento"
3. Se abre un dialogo donde elige tipo (2o email, llamada, etc.), titulo, resultado
4. Se guarda la interaccion y se actualiza el follow_up_count y follow_up_status
5. En la tabla se muestra el badge de seguimiento actualizado (ej: "Follow-up 2", "Interesado", "Reunion")

### Archivos a crear/modificar
- **Crear**: `supabase/migrations/xxx_campaign_interactions.sql`
- **Crear**: `src/hooks/useCampaignCompanyInteractions.ts`
- **Crear**: `src/components/admin/campanas-valoracion/CampaignCompanyInteractionDialog.tsx`
- **Modificar**: `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` (dropdown + badges + filtros)
- **Modificar**: `src/components/admin/campanas-valoracion/steps/CampaignSummaryStep.tsx` (KPIs + columna)
- **Modificar**: `src/hooks/useCampaignCompanies.ts` (stats actualizados)
