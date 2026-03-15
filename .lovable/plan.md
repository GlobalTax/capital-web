

## Plan: Sistema de descarga de la "Guía para Vender tu Empresa" (PDF Lead Magnet)

### El PDF

La guía tiene 12 capítulos, 20+ páginas, con contenido de alto valor (valoración, due diligence, fiscalidad, checklist). Es el lead magnet perfecto para capturar empresarios que se plantean vender.

### Estrategia de distribución: 6 puntos de contacto

| Ubicacion | Tipo de CTA | Captura de datos |
|-----------|------------|-----------------|
| 1. Landing propia `/recursos/guia-vender-empresa` | Formulario completo (email + nombre + empresa) | Si - lead magnet |
| 2. Sidebar del blog (todos los posts) | Banner compacto con boton | Si - email minimo |
| 3. Dentro de articulos (inline CTA) | Banner horizontal entre secciones | Si - email minimo |
| 4. Home (nueva seccion) | Card destacada con preview del PDF | Link a landing |
| 5. Pagina `/venta-empresas` | Banner contextual | Link a landing |
| 6. Hub Venta Empresa | Seccion de recursos | Link a landing |

### Implementacion tecnica

#### 1. Subir PDF a Supabase Storage
- Subir `guia-vender-empresa-capittal.pdf` al bucket existente (o crear uno `lead-magnets` si no existe)
- Generar URL publica para la descarga

#### 2. Registrar en `lead_magnets` (tabla existente)
- INSERT con `type: 'report'`, `sector: 'general'`, `file_url` apuntando al storage
- El sistema de tracking (`lead_magnet_downloads`) ya existe y tiene trigger automatico

#### 3. Crear landing `/recursos/guia-vender-empresa`
- Nueva pagina con formulario de captura (reutilizando patron de `LeadMagnetLandingPage`)
- Contenido especifico: preview de los 12 capitulos, estadisticas (78% empresarios, 15-25% mas precio), cita de Samuel
- SEO optimizado con schema markup
- Ruta en `AppRoutes.tsx`

#### 4. Componente `BlogGuideDownloadCTA`
- Nuevo componente para sidebar del blog (junto al `BlogValuationCTA` existente)
- Diseno dark similar al CTA de valoracion actual pero con icono de PDF/libro
- Mini-formulario inline (solo email) o link a landing
- Se anade en `BlogPostContent.tsx` debajo de `BlogValuationCTA`

#### 5. Componente `InlineGuideDownloadBanner`
- Banner horizontal para insertar dentro del contenido HTML de los articulos
- Se puede renderizar automaticamente despues del 3er H2 de cada post
- Alternativa: insertarlo manualmente via HTML en los posts que mas conviertan

#### 6. Seccion en Home
- Nueva seccion `GuideDownloadSection` entre `MANewsSection` y `WhyChooseCapittal`
- Preview visual del PDF (portada) + 3-4 bullets del contenido + CTA a landing
- Diseno limpio, no agresivo

#### 7. CTA en paginas de servicio
- Banner en `/venta-empresas` despues de la seccion de proceso
- Seccion en `/hub-venta-empresa` como recurso complementario

### Flujo de conversion

```text
Usuario llega (blog/home/servicio)
  → Ve CTA de la guia
  → Click → Landing /recursos/guia-vender-empresa
  → Rellena formulario (email obligatorio)
  → INSERT en lead_magnet_downloads (trigger incrementa contador)
  → PDF se abre en nueva pestana (signed URL)
  → Pagina de confirmacion con CTA secundario (calculadora/contacto)
```

### Archivos a crear/modificar

| Archivo | Accion |
|---------|--------|
| `src/pages/recursos/GuiaVenderEmpresa.tsx` | Crear - Landing page |
| `src/components/blog/BlogGuideDownloadCTA.tsx` | Crear - CTA sidebar blog |
| `src/components/blog/InlineGuideDownloadBanner.tsx` | Crear - Banner inline |
| `src/components/home/GuideDownloadSection.tsx` | Crear - Seccion home |
| `src/components/blog/BlogPostContent.tsx` | Modificar - Anadir CTA guia en sidebar |
| `src/pages/Index.tsx` | Modificar - Anadir seccion guia |
| `src/pages/VentaEmpresas.tsx` | Modificar - Anadir banner guia |
| `src/core/routing/AppRoutes.tsx` | Modificar - Nueva ruta |
| `src/data/siteRoutes.ts` | Modificar - Registrar ruta para SEO |
| SQL migration | Crear bucket storage + INSERT en lead_magnets |

### Prioridad de implementacion

1. Storage + registro en DB (prerequisito)
2. Landing page propia (pagina principal de conversion)
3. CTA en sidebar del blog (mayor volumen de trafico organico)
4. Seccion en Home
5. Banners en paginas de servicio
6. Inline CTA en articulos

