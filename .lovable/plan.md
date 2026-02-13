

## Generar y almacenar PDFs en las campañas outbound

### Problema actual
El flujo de campañas envía emails con los datos de valoración en HTML, pero **no genera ningún PDF**. No hay forma de acceder ni descargar el informe PDF de cada empresa de la campaña.

### Solucion
Añadir generación de PDF con `@react-pdf/renderer` (usando el componente `ProfessionalValuationPDF` ya existente) durante el envío, subirlo a Supabase Storage, y guardar la URL en `valuation_campaign_companies` para acceso posterior.

### Cambios

#### 1. Base de datos: nueva columna `pdf_url`
Migración para añadir la columna donde se guardará la URL del PDF generado:
```sql
ALTER TABLE valuation_campaign_companies ADD COLUMN pdf_url TEXT;
```

#### 2. ProcessSendStep.tsx - Generar PDF antes de enviar
Para cada empresa, antes de llamar al edge function:
- Importar dinámicamente `@react-pdf/renderer` y `ProfessionalValuationPDF`
- Mapear los datos de la empresa de campaña al formato `ProfessionalValuationData`
- Generar el blob PDF en el cliente
- Convertir a base64
- Enviarlo como `pdfBase64` al edge function (que ya lo sube a Storage y lo adjunta al email)
- Guardar la `pdfUrl` devuelta por el edge function en `valuation_campaign_companies`

#### 3. ProcessSendStep.tsx - Botón de descarga en la tabla de resultados
Añadir una columna "PDF" a la tabla de resultados con un icono/botón de descarga que abre la URL almacenada en `pdf_url`.

### Flujo resultante

```
Por cada empresa:
1. Generar PDF en cliente (ProfessionalValuationPDF)
2. Convertir a base64
3. Enviar al edge function con pdfBase64
4. Edge function sube a Storage + adjunta al email
5. Guardar pdf_url en valuation_campaign_companies
6. Usuario puede descargar desde la tabla de resultados
```

### Archivos afectados

| Archivo | Cambio |
|---------|--------|
| Nueva migración SQL | Columna `pdf_url TEXT` en `valuation_campaign_companies` |
| `src/integrations/supabase/types.ts` | Se regenera |
| `src/components/admin/campanas-valoracion/steps/ProcessSendStep.tsx` | Generación PDF + envío base64 + columna descarga |

### Detalles tecnicos

- Se reutiliza `ProfessionalValuationPDF` (1171 líneas) sin duplicar código
- La generación se hace con dynamic import para no cargar `@react-pdf/renderer` en el bundle principal
- El edge function ya tiene toda la lógica de subida a Storage (líneas 578-601) y attachment (líneas 607-610), solo necesita recibir `pdfBase64`
- Se añade un delay adicional mínimo entre empresas para no saturar la generación de PDFs
- Fallback: si la generación de PDF falla, el email se envía igualmente sin adjunto (siguiendo el protocolo de decoupling existente)

