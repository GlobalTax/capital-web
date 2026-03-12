

## Add resend with confirmation to DocumentSendStep

### Problem
In the Document campaign send step (`DocumentSendStep.tsx`), once an email is sent, there are no actions available — no way to resend. The user needs a resend option in the actions column with a confirmation dialog to prevent accidental resends.

### Changes (single file: `DocumentSendStep.tsx`)

1. **Add imports**: `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`, `AlertDialog` components, `MoreVertical`, `RefreshCw` icons.

2. **Add resend logic**: Before calling `sendEmail`, reset the email status to `pending` by updating `campaign_emails` (clear `sent_at`, `error_message`, set `status = 'pending'`), then invoke `sendEmail`.

3. **Add resend confirmation state**: `resendConfirm` state to track which email/company is pending confirmation (single or bulk).

4. **Update actions column** (lines 208-228): Replace the simple "Enviar" button with a dropdown menu:
   - For `pending`: "Enviar" option
   - For `sent`: "Reenviar email" option (triggers confirmation dialog)
   - For `error`: "Reintentar" option (also triggers confirmation)

5. **Add AlertDialog** at the bottom: Warning message like "⚠️ Este email ya fue enviado a [empresa]. ¿Estás seguro de que quieres reenviarlo?" with "Cancelar" and "Sí, reenviar" buttons.

6. **Add bulk resend button**: Next to "Enviar todos", show a "Reenviar X enviados" button when there are sent emails, also with confirmation.

### Resend mechanism
```typescript
const resetAndResend = async (emailId: string) => {
  // Reset to pending
  await supabase.from('campaign_emails')
    .update({ status: 'pending', sent_at: null, error_message: null })
    .eq('id', emailId);
  // Invalidate cache so hook picks up the change
  // Then send
  await sendEmail(emailId);
};
```

This mirrors exactly what `ProcessSendStep` does for valuation campaigns via `resetEmailToPending`.

