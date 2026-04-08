

## Plan: 4 variantes de email en el desplegable del pipeline

### Resumen
Reemplazar el botón único "Enviar email pre-llamada" por un submenú con 4 opciones:
1. **Enviar Mail - Valoración - Cast** (el template actual)
2. **Enviar Mail - Venta - Cast** (nuevo, con el texto que has proporcionado)
3. **Enviar Mail - Valoración - Cat** (traducción al catalán del template actual)
4. **Enviar Mail - Venta - Cat** (traducción al catalán del template de Venta)

### Cambios

**1. `buildPrecallEmailPreview.ts` — Añadir parámetro `variant` y 4 plantillas**

Añadir un tipo `EmailVariant = 'valoracion-cast' | 'venta-cast' | 'valoracion-cat' | 'venta-cat'` al builder. Según el variant, se genera el cuerpo del email correspondiente:

- **Valoración Cast**: el texto actual (formulario de valoración automática)
- **Venta Cast**: el texto que has proporcionado (servicios de asesoramiento en compraventa)
- **Valoración Cat**: traducción al catalán del template de valoración
- **Venta Cat**: traducción al catalán del template de venta

El asunto también varía: "Consulta M&A | Empresa <> Capittal" para castellano, "Consulta M&A | Empresa <> Capittal" para catalán (mismo formato, el cuerpo cambia).

**2. `PipelineCard.tsx` — Submenú con 4 opciones**

Cambiar `onSendPrecallEmail: () => void` a `onSendPrecallEmail: (variant: EmailVariant) => void`.

El `DropdownMenuItem` actual se reemplaza por un `DropdownMenuSub` con 4 items:
```
▸ Enviar email
    Valoración - Castellano
    Venta - Castellano
    Valoración - Català
    Venta - Català
```
Todos deshabilitados si `precall_email_sent` es true.

**3. `LeadsPipelineView.tsx` — Pasar variant al builder**

`handleSendPrecallEmail` recibe el `variant` y lo pasa a `buildPrecallEmailPreview`, que genera el preview con la plantilla correspondiente.

**4. Edge Function `send-precall-email` — Aceptar `htmlBody` editado**

La Edge Function ya recibe el `htmlBody` editado desde el dialog de preview, así que no necesita cambios — el contenido enviado es el que el usuario ve y confirma en el preview.

### Textos

**Venta - Castellano** (Bloque 1 confirmado):
- Intro: "Soy [Nombre], miembro del equipo de Capittal. [CC mention]"
- Cuerpo: "Hemos recibido recientemente una solicitud a través de nuestro formulario interesándose por nuestros servicios de asesoramiento en compraventa de empresas. Tras analizar vuestra actividad y la información disponible, nos ha parecido especialmente interesante el trabajo que realizáis."
- "Desconozco si estáis valorando una posible venta, si os ha contactado algún inversor, o simplemente queréis tener una referencia del valor de la empresa..."
- Cierre: "Quedo a tu disposición para cualquier duda o comentario."

**Traducciones al catalán**: Generadas a partir de los textos castellanos manteniendo el mismo tono formal y profesional.

### Archivos afectados
- `src/features/leads-pipeline/utils/buildPrecallEmailPreview.ts` — 4 plantillas
- `src/features/leads-pipeline/components/PipelineCard.tsx` — submenú dropdown
- `src/features/leads-pipeline/components/LeadsPipelineView.tsx` — pasar variant

