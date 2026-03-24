

## Fix: destinatarios BCC aparecen en CC visible al cliente

### Causa raíz

En `send-professional-valuation-email/index.ts` (línea 613-614), cuando el formulario envía `selectedRecipients`, **todos** se meten en CC sin consultar el campo `is_bcc` de la base de datos:

```typescript
if (requestData.selectedRecipients && requestData.selectedRecipients.length > 0) {
  ccRecipients = requestData.selectedRecipients; // ← TODOS van a CC
}
```

Resultado: los miembros del equipo marcados como "Copia Oculta" aparecen visibles en CC para el cliente.

### Solución

**Archivo: `supabase/functions/send-professional-valuation-email/index.ts`**

Cuando hay `selectedRecipients`, cruzar con `email_recipients_config` para separar CC y BCC:

```typescript
if (requestData.selectedRecipients && requestData.selectedRecipients.length > 0) {
  // Consultar is_bcc de cada destinatario seleccionado
  const { data: recipientFlags } = await supabase
    .from('email_recipients_config')
    .select('email, is_bcc')
    .in('email', requestData.selectedRecipients)
    .eq('is_active', true);
  
  const bccSet = new Set(
    (recipientFlags || []).filter(r => r.is_bcc).map(r => r.email.toLowerCase())
  );
  
  ccRecipients = requestData.selectedRecipients.filter(
    e => !bccSet.has(e.toLowerCase())
  );
  bccRecipients = requestData.selectedRecipients.filter(
    e => bccSet.has(e.toLowerCase())
  );
}
```

Esto respeta la configuración de cada destinatario: los que están marcados como BCC van en BCC, el resto en CC.

### Resultado
- Los miembros del equipo marcados como "Copia Oculta" dejarán de ser visibles para el cliente
- Los marcados como CC seguirán apareciendo en CC normalmente
- No hay cambios en la UI del formulario

