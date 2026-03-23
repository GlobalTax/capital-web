

## Rediseñar email ROD + enviar test a oriol@capittal.es

### Problema
El email actual que recibe el usuario tras descargar la ROD es genérico, con diseño básico (gradiente azul, emojis, Arial). No refleja la marca Capittal ni el tono boutique/profesional.

### Rediseño del template

**Archivo: `supabase/functions/generate-rod-document/index.ts`** — función `generateEmailHTML` (líneas 498-635)

Reemplazar ambas versiones (EN + ES) con un diseño profesional:

- **Tipografía**: Plus Jakarta Sans (importada via Google Fonts link en el `<head>`, fallback Arial)
- **Colores**: Navy oscuro `#1a1f2e` (primary), indigo `#4f46e5` como acento, fondo `#f8f9fa`
- **Logo**: Incluir `https://webcapittal.lovable.app/logotipo.png` en la cabecera sobre fondo oscuro
- **Cabecera**: Fondo navy `#1a1f2e`, logo centrado, sin gradientes llamativos
- **Cuerpo**: Tono profesional y conciso. Eliminar emojis. Saludo personalizado con nombre. Breve párrafo de agradecimiento.
- **Bloque ROD**: Card con borde sutil mostrando el número de operaciones y un CTA "Descargar ROD" / "Download ROD" con botón indigo
- **Próximos pasos**: Lista limpia sin emojis, con icono de check o numeración elegante
- **Firma**: "Equipo Capittal" con email oportunidades@capittal.es y teléfono +34 695 717 490
- **Footer**: Texto legal discreto, copyright, link a web

### Enviar test

Después de desplegar, invocar la edge function con datos de prueba para enviar a `oriol@capittal.es`:
- Nombre: "Oriol Test"
- Email: oriol@capittal.es
- Para que llegue el email real necesitamos que exista un ROD activo (ya debería existir)

Se usará `supabase--curl_edge_functions` para invocar `generate-rod-document` con los datos de test.

### Archivos modificados
1. `supabase/functions/generate-rod-document/index.ts` — reescribir `generateEmailHTML`
2. Deploy de la edge function

