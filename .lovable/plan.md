

## Plan: Sistema de Biblioteca de Recursos tipo HubSpot

### Concepto

Replicar el modelo de HubSpot: una **página de biblioteca de recursos** pública con filtros por categoría/formato, donde cada recurso enlaza a una **landing page con formulario gate** que captura el lead antes de entregar el contenido.

### Lo que ya existe

- Tabla `lead_magnets` en Supabase con título, tipo, sector, descripción, file_url, status
- Tabla `lead_magnet_downloads` para tracking de conversiones
- Hook `useLeadMagnets` (CRUD) y `useLeadMagnetDownloads` (registro)
- Admin panel en `/admin/lead-magnets` para gestionar contenido
- Una landing manual: `GuiaVenderEmpresa.tsx`

### Lo que falta

1. **Página pública de biblioteca** (`/recursos/biblioteca`) con grid filtrable
2. **Landing page dinámica** que genera automáticamente una página gate por cada lead magnet activo
3. Campos adicionales en `lead_magnets` para la landing (featured_image, preview bullets, etc.)

---

### Cambios propuestos

#### 1. Crear `/recursos/biblioteca` — Resource Library Page
Página pública con:
- Hero con título "Biblioteca de Recursos M&A"
- Filtros por **tipo** (Informe, Whitepaper, Checklist, Plantilla) y **sector**
- Grid de cards con imagen, badge de tipo, título, descripción y CTA "Acceder Gratis"
- Cada card enlaza a `/recursos/biblioteca/:slug` (la landing gate)
- Datos de `lead_magnets` donde `status = 'active'`

#### 2. Crear `/recursos/biblioteca/:slug` — Landing Page Gate dinámica
Página individual por recurso, estilo HubSpot offer page:
- Hero split: izquierda texto (título, descripción, bullets de contenido), derecha formulario gate
- Formulario: email (requerido), nombre, empresa, teléfono
- Al submit: registra en `lead_magnet_downloads`, descarga/abre el `file_url`
- Post-descarga: estado de éxito con CTA secundario
- Sección de "qué incluye" si hay highlights
- FAQ mínimo (ej: "¿Es realmente gratis?", "¿Por qué piden mis datos?")
- Social proof con métricas de descargas

#### 3. Añadir ruta en AppRoutes.tsx
```
/recursos/biblioteca → ResourceLibrary
/recursos/biblioteca/:slug → ResourceLandingPage
```

#### 4. Añadir enlace en el menú de Recursos
Actualizar `recursosData.ts` para incluir "Biblioteca de Recursos" en la sección de Contenido.

### Archivos a crear

1. `src/pages/recursos/ResourceLibrary.tsx` — página de biblioteca con filtros y grid
2. `src/pages/recursos/ResourceLandingPage.tsx` — landing gate dinámica por slug
3. `src/components/recursos/ResourceCard.tsx` — card reutilizable para el grid
4. `src/components/recursos/ResourceGateForm.tsx` — formulario de captura reutilizable

### Archivos a editar

5. `src/core/routing/AppRoutes.tsx` — añadir rutas
6. `src/components/header/data/recursosData.ts` — añadir enlace al menú

### Notas

- `GuiaVenderEmpresa.tsx` seguirá existiendo como landing manual (es más personalizada). En el futuro se podría migrar al sistema dinámico.
- Los lead magnets se gestionan desde el admin existente (`/admin/lead-magnets`). Solo necesitan tener `landing_page_slug` y `file_url` configurados para aparecer en la biblioteca.
- El diseño seguirá la paleta existente (slate, primary) y los componentes de shadcn/ui.

