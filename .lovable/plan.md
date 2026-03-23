

## Añadir opción de Copia Oculta (BCC) a destinatarios de email

### Concepto
Actualmente cada destinatario tiene "Copia por defecto" que lo incluye en CC. Se añade una nueva opción para que un destinatario pueda recibir los emails en **BCC (copia oculta)** en lugar de CC visible.

### Cambios

**1. Migración SQL**: Añadir columna `is_bcc` a `email_recipients_config`
```sql
ALTER TABLE email_recipients_config ADD COLUMN is_bcc BOOLEAN DEFAULT false;
```
Los destinatarios con `is_default_copy = true` e `is_bcc = true` irán en BCC. Los que tengan `is_bcc = false` irán en CC como hasta ahora.

**2. UI — `src/pages/admin/EmailRecipientsConfig.tsx`**
- Añadir columna "Copia Oculta" en la tabla (con Switch, igual que "Copia por Defecto")
- Añadir Switch "Copia oculta (BCC)" en el formulario de añadir/editar
- Mostrar badge "BCC" junto al nombre si está activado
- Añadir stat card con el conteo de destinatarios BCC

**3. Hook — `src/hooks/useEmailRecipientsConfig.ts`**
- Añadir `is_bcc` al tipo `EmailRecipient`
- Añadir mutación `toggleBcc` similar a `toggleDefaultCopy`

**4. Edge Functions** (4 archivos: `send-form-notifications`, `send-valuation-email`, `send-professional-valuation-email`, `send-campaign-outbound-email`)
- Al obtener destinatarios, separar los que tienen `is_bcc = true` (van en BCC) de los que no (van en CC)
- Usar el campo `bcc` de Resend para los marcados como BCC

### Resultado
Cada destinatario puede configurarse individualmente como CC visible o BCC (copia oculta), directamente desde el panel de configuración.

