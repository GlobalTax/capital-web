

## Redisenar la pagina /contacto

### Resumen

Reemplazar la pagina de contacto actual (que es un formulario centrado simple) con un diseno mas completo que incluya formulario con sidebar de informacion, Google Maps embebido, trust signals y SEO actualizado.

### Cambios propuestos

#### 1. Nuevo componente de pagina `src/pages/Contacto.tsx`

Reescribir la pagina completa con layout de 2 columnas (en desktop):

- **Columna izquierda (formulario)**: H1 "Contacta con nosotros", subtitulo, y formulario de contacto personalizado
- **Columna derecha (sidebar)**: Informacion de contacto, Google Maps embebido, y trust signals

El formulario tendra estos campos (diferentes al formulario generico actual):
- Nombre completo (required)
- Email (required)
- Telefono (optional)
- Empresa (optional - actualmente es required en el schema generico)
- Tipo de consulta: dropdown con 5 opciones: "Quiero vender mi empresa", "Quiero comprar/adquirir", "Necesito una valoracion", "Due Diligence", "Otro"
- Mensaje (textarea)
- Boton: "Enviar consulta"

En lugar de modificar el `ContactForm` generico (que se usa en multiples sitios), se creara un formulario inline directamente en la pagina de contacto, reutilizando el hook `useContactForm` y el schema de validacion existente.

#### 2. Sidebar de informacion de contacto

Incluira:
- **Direccion**: Ausias March 36, Principal, Barcelona (con icono MapPin)
- **Google Maps embed**: iframe con la ubicacion de la oficina
- **Telefono**: +34 695 717 490 como enlace `tel:` (click-to-call en movil)
- **Email**: info@capittal.es como enlace `mailto:`
- **LinkedIn**: enlace a la pagina de empresa

#### 3. Trust signals

Seccion con 4 indicadores en grid:
- "+70 profesionales"
- "Especialistas en sector seguridad"
- "Operaciones con PE internacional"
- "Maxima confidencialidad"

#### 4. SEO y SSR

Actualizar el titulo y descripcion SEO:
- **Title**: "Contacto | Capittal Transacciones - Asesores M&A Barcelona"
- **Description**: "Contacta con Capittal para asesoramiento en M&A, valoraciones y due diligence. Oficinas en Ausias March 36, Barcelona."

Actualizar la entrada en `pages-ssr/index.ts` para `/contacto` con los nuevos meta tags, direccion actualizada y schema LocalBusiness en structuredData.

Actualizar los textos en `src/shared/i18n/dictionaries.ts` para las claves `contacto.seo.title` y `contacto.seo.description`.

### Detalles tecnicos

| Archivo | Cambio |
|---------|--------|
| `src/pages/Contacto.tsx` | Reescribir con layout 2 columnas, formulario personalizado, sidebar, maps, trust signals |
| `src/shared/i18n/dictionaries.ts` | Actualizar claves SEO de contacto (es, ca, en) |
| `supabase/functions/pages-ssr/index.ts` | Actualizar meta tags y contenido SSR para `/contacto` |
| `src/schemas/contactFormSchema.ts` | Extender serviceType enum para incluir "valoracion" y "due-diligence" |

### Nota sobre el formulario

El dropdown de "Tipo de consulta" necesita 5 opciones pero el schema actual solo permite 3 (`vender`, `comprar`, `otros`). Se extendera el enum a: `vender`, `comprar`, `valoracion`, `due-diligence`, `otros`. Esto es compatible con el backend porque el campo se envia como string al Edge Function.

### Diseno responsive

- Desktop: 2 columnas (formulario 60% + sidebar 40%)
- Tablet: 2 columnas mas compactas
- Movil: 1 columna, sidebar debajo del formulario
