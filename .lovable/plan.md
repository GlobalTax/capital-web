
## Corregir el logo del email ROD para que salga bien en Outlook sin error

### Problema real
El logo no está “mal” como archivo: el problema es que ahora se inserta como imagen remota:

```ts
<img src="https://webcapittal.lovable.app/logotipo-white.png" ... />
```

En Outlook eso dispara el bloqueo de descarga automática de imágenes externas, por eso aparece el icono roto y el aviso de seguridad. Si quieres que el logo aparezca bien “sin error”, no debe cargarse desde una URL remota.

### Solución correcta
Cambiar el email para usar el logo como **imagen inline embebida por CID** con Resend.

Así:
- el HTML deja de apuntar a una URL pública
- Resend adjunta la imagen dentro del propio email
- Outlook la renderiza como parte del mensaje en vez de bloquearla como recurso externo

### Cambios

**Archivo:** `supabase/functions/generate-rod-document/index.ts`

1. **Cambiar el HTML del logo**
   - En `generateEmailHTML`, sustituir:
   ```html
   <img src="${logoUrl}" ... />
   ```
   por:
   ```html
   <img src="cid:capittal-logo" ... />
   ```

2. **Adjuntar el logo inline en el envío con Resend**
   - En `resend.emails.send({...})` del email al usuario, añadir `attachments` con `contentId: 'capittal-logo'`
   - Se usará el archivo ya creado `logotipo-white.png`

   Patrón:
   ```ts
   attachments: [
     {
       path: 'https://webcapittal.lovable.app/logotipo-white.png',
       filename: 'logotipo-white.png',
       contentId: 'capittal-logo',
     }
   ]
   ```

3. **Mantener el header oscuro actual**
   - No tocar el diseño boutique que ya funciona
   - Solo cambiar la forma en que se entrega la imagen

4. **Refuerzo visual mínimo**
   - Dejar `width`, `height:auto`, `display:block`/`inline-block`
   - Añadir buen `alt="Capittal"` para fallback limpio si algún cliente extremo no la carga

### Por qué esta solución es la buena
- No “rompe” el diseño actual
- No depende de que Outlook descargue imágenes externas
- Evita el aviso visual de recurso bloqueado
- Usa una capacidad documentada de Resend específicamente para logos inline

### Qué no voy a tocar
- No cambiaré el copy del email
- No cambiaré colores, CTA ni estructura
- No tocaré la lógica de generación/descarga de la ROD
- No tocaré el email interno salvo que quieras el mismo tratamiento allí también

### Validación
Después de aplicar el cambio:
1. desplegar la edge function `generate-rod-document`
2. enviar test a `oriol@capittal.es`
3. comprobar específicamente en Outlook que:
   - el logo aparece renderizado
   - no sale el icono roto
   - no depende de “download pictures”

### Nota técnica
El activo `public/logotipo-white.png` parece correcto; la captura encaja más con un **bloqueo de imágenes externas del cliente de correo** que con un PNG corrupto. El problema está en el método de inserción, no en el logo.
