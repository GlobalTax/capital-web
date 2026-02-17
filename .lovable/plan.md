
# Adjuntar Acuerdo de Confidencialidad con la Valoracion

## Objetivo

Cuando se envia el email de valoracion al cliente, adjuntar automaticamente un PDF de "Acuerdo de Confidencialidad" junto al informe de valoracion. Esto genera confianza inmediata en que Capittal protege los datos y comunicaciones del cliente.

## Que se hara

### 1. Crear el PDF de Confidencialidad (estatico, profesional)

Se creara un PDF profesional generado directamente en la Edge Function `send-valuation-email` usando `pdf-lib` (ya importado). El documento incluira:

- **Titulo**: "Compromiso de Confidencialidad"
- **Partes**: Capittal Transacciones S.L. y el nombre/empresa del cliente (datos dinamicos)
- **Clausulas clave**:
  - Obligacion de confidencialidad sobre toda la informacion compartida
  - Duracion: 3 anos desde la fecha del documento
  - Uso exclusivo para evaluar la operacion
  - No divulgacion a terceros sin consentimiento
  - Devolucion/destruccion de documentos si no se avanza
- **Firma**: Firmado digitalmente por Capittal (texto "Firmado electronicamente por Capittal Transacciones S.L.")
- **Fecha**: Fecha actual del envio
- **Pie**: Datos de contacto y direccion de Capittal

### 2. Modificar la Edge Function `send-valuation-email`

Cambios en el flujo de envio al cliente:

- Generar el PDF de confidencialidad con los datos del cliente (nombre, empresa)
- Adjuntarlo como segundo archivo en el email al cliente (ademas del PDF de valoracion)
- Nombre del archivo: `Capittal-Compromiso-Confidencialidad-[NombreEmpresa].pdf`

El email al cliente incluira ambos adjuntos:
1. `Capittal-Valoracion-[Empresa].pdf` (ya existente)
2. `Capittal-Compromiso-Confidencialidad-[Empresa].pdf` (nuevo)

### 3. Actualizar el texto del email al cliente

Anadir una mencion en el cuerpo del email que refuerce el compromiso:

> "Adjuntamos tambien nuestro Compromiso de Confidencialidad, que garantiza la proteccion absoluta de toda la informacion compartida durante este proceso."

### 4. Subir el PDF de confidencialidad a Storage

Igual que se hace con el PDF de valoracion, subir el PDF de confidencialidad al bucket `valuations` de Supabase Storage para tenerlo archivado.

## Detalles tecnicos

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-valuation-email/index.ts` | Generar PDF de confidencialidad con pdf-lib, adjuntarlo al email del cliente, actualizar HTML del email |

### Generacion del PDF

Se reutiliza `pdf-lib` (ya importado) para generar un PDF de 1-2 paginas con:
- Encabezado con logo/nombre Capittal
- Datos del cliente rellenados dinamicamente
- Clausulas legales estandar
- Fecha y firma electronica

### Estructura del adjunto en Resend

```text
attachments: [
  { filename: 'Valoracion.pdf', content: pdfValoracionBase64 },
  { filename: 'Compromiso-Confidencialidad.pdf', content: pdfConfidencialidadBase64 }
]
```

### Impacto

- **No se modifican** componentes React del frontend
- **No se crean** nuevas tablas en la BD
- **No se rompe** el flujo existente de Fase 0 NDA (ese es un documento separado para el proceso de mandato)
- El PDF de confidencialidad es **automatico**: se genera y adjunta sin intervencion del usuario
- Si la generacion del PDF de confidencialidad falla, el email se envia igualmente solo con el PDF de valoracion (patron de desacoplamiento existente)

## Relacion con el NDA de Fase 0

El sistema ya tiene un NDA formal en `fase0-documents` para el proceso de mandato (Fase 0). Este **Compromiso de Confidencialidad** es diferente:
- Es un documento unilateral de Capittal (no requiere firma del cliente)
- Se envia automaticamente con cada valoracion
- Es mas ligero que el NDA formal
- Sirve como primer contacto de confianza, antes de llegar al NDA contractual del mandato
