
## Hacer que el logo sí salga en el email ROD y reenviar test

### Lo que he comprobado
- El email ahora mismo usa una imagen remota:
  ```html
  <img src="https://webcapittal.lovable.app/logotipo-white.png" ... />
  ```
- Ese archivo existe en `public/logotipo-white.png`.
- La edge function `generate-rod-document` sí está enviando emails correctamente según logs recientes (`User email sent`).
- El problema no parece ser “que no llegue”, sino cómo renderiza el logo en algunos clientes de correo.

### Qué propongo
Ajustar el email para maximizar compatibilidad del logo en clientes de correo, sin volver a la versión que rompía el envío.

### Cambios
**Archivo:** `supabase/functions/generate-rod-document/index.ts`

1. **Mantener el logo como imagen pública**
   - No volver a CID si eso ya provocó fallos de entrega.

2. **Usar el logo correcto y estable**
   - Revisar si conviene usar `logotipo-white.png` o el logo nuevo subido (`Logo_Capittal_MA_Consulting.png`) según contraste y legibilidad sobre fondo oscuro.
   - Mi recomendación: seguir con versión blanca para el header navy, pero sustituirla por un asset optimizado si el actual tiene problemas de render.

3. **Endurecer el HTML para email**
   - Añadir atributos y estilos más compatibles:
   ```html
   <img
     src="..."
     alt="Capittal"
     width="160"
     border="0"
     style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;height:auto;"
   />
   ```
   - Envolverlo en tabla centrada para Outlook.

4. **Añadir fallback visual**
   - Incluir texto de marca “Capittal” visible en el header por si algún cliente bloquea imágenes.
   - Así, aunque no cargue el logo, no se verá “vacío” o roto visualmente.

5. **Evitar dependencias frágiles**
   - Si el asset nuevo que has subido es más fiable, lo copiaría al proyecto/public para servirlo desde una ruta estable y usaría esa URL en el email.

6. **Enviar prueba**
   - Reenviar email de test a `orioliglesiasayuso@gmail.com` después del ajuste.

### Resultado esperado
- El email seguirá entregándose.
- El logo tendrá muchas más probabilidades de renderizar bien en Gmail/Outlook/Apple Mail.
- Si el cliente bloquea imágenes externas, al menos la cabecera seguirá viéndose profesional gracias al fallback textual.

### Nota importante
No puedo garantizar al 100% que **todos** los clientes muestren imágenes remotas automáticamente, porque algunos las bloquean por política del cliente. Lo que sí puedo hacer es dejar el HTML correctamente preparado para que:
- no se vea “roto”
- tenga fallback elegante
- use un asset correcto y estable
- no vuelva a romper el envío

### Validación
1. actualizar el bloque header del email
2. desplegar la función
3. enviar test a `orioliglesiasayuso@gmail.com`
4. comprobar:
   - que llega
   - que el logo se ve mejor
   - que, si se bloquea la imagen, el header sigue quedando bien

### Detalle técnico
Ahora mismo el punto exacto a tocar es:
- `generateEmailHTML(...)` en `supabase/functions/generate-rod-document/index.ts`, especialmente el bloque:
  ```ts
  <td style="background-color:#1a1f2e;padding:32px 40px;text-align:center;border-radius:12px 12px 0 0;">
    <img src="https://webcapittal.lovable.app/logotipo-white.png" alt="Capittal" width="160" style="display:inline-block;max-width:160px;height:auto;" />
  </td>
  ```
- Ahí haría el ajuste de compatibilidad y fallback antes de reenviar la prueba.
