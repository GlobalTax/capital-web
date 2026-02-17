
# Añadir Logo de Capittal al PDF de Confidencialidad

## Objetivo

Reemplazar el texto "CAPITTAL" del encabezado del PDF de Compromiso de Confidencialidad por el logotipo real de Capittal como imagen embebida.

## Enfoque

Dentro de la Edge Function `send-valuation-email`, antes de generar el PDF de confidencialidad, se descargara el logo PNG desde la URL publica existente (`https://capittal.es/lovable-uploads/capittal-logo-white.png` o una version en color oscuro si existe) y se embebera como imagen en el encabezado del PDF usando `pdfDoc.embedPng()` de pdf-lib.

Si la descarga del logo falla (red, timeout, etc.), se mantendra el texto "CAPITTAL" como fallback para no romper la generacion del PDF.

## Cambios

### Archivo modificado

| Archivo | Cambio |
|---|---|
| `supabase/functions/send-valuation-email/index.ts` | Descargar logo, embeber en ambos PDFs (valoracion y confidencialidad) |

### Detalle tecnico

1. **Descargar el logo** al inicio de la funcion (una sola vez, reutilizable para ambos PDFs):
   ```text
   const logoUrl = 'https://capittal.es/lovable-uploads/capittal-logo-white.png';
   let logoBytes: Uint8Array | null = null;
   try {
     const resp = await fetch(logoUrl);
     logoBytes = new Uint8Array(await resp.arrayBuffer());
   } catch { /* fallback a texto */ }
   ```

2. **En `generateConfidentialityPdf`**: recibir `logoBytes` como parametro opcional. Si existe, usar `pdfDoc.embedPng(logoBytes)` y `page.drawImage()` para dibujar el logo en el encabezado (aprox 120x30px). Si no existe, mantener el `drawText('CAPITTAL')` actual.

3. **En `generateValuationPdfBase64`**: aplicar el mismo patron para consistencia visual entre ambos PDFs.

4. **Dimensiones del logo**: Se escalara proporcionalmente a un ancho de ~120px, manteniendo la relacion de aspecto original.

### Impacto

- El logo se descarga una sola vez por ejecucion de la funcion
- Si falla la descarga, el PDF se genera igualmente con texto (patron de fallback existente)
- Ambos PDFs (valoracion y confidencialidad) tendran el logo consistente
- No se modifican tablas ni componentes frontend
