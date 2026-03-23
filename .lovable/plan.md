

## Reemplazar logo por texto "Capittal" en blanco

### Cambio

**Archivo: `supabase/functions/generate-rod-document/index.ts`** — líneas 559-569

Eliminar la imagen del logo y los condicionales MSO. Sustituir por texto "Capittal" en blanco, grande y elegante:

```html
<td style="background-color:#1a1f2e;padding:32px 40px;text-align:center;border-radius:12px 12px 0 0;">
  <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;font-family:'Plus Jakarta Sans',Arial,sans-serif;letter-spacing:1px;">Capittal</h1>
  <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;font-weight:600;letter-spacing:2px;text-transform:uppercase;font-family:'Plus Jakarta Sans',Arial,sans-serif;">M&amp;A · CONSULTING</p>
</td>
```

Se elimina: `<img>`, los bloques `<!--[if mso]>`, y el `<div>` spacer.

### Después
- Desplegar edge function
- Enviar test a `orioliglesiasayuso@gmail.com`

