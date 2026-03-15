

## Revisión de la Landing de Guía para Vender Empresa

### Bug crítico encontrado

El formulario de descarga **no funcionará** al enviar. El `recordDownload` en `GuiaVenderEmpresa.tsx` pasa el slug `'guia-vender-empresa'` como `lead_magnet_id`, pero la columna `lead_magnet_downloads.lead_magnet_id` es de tipo **UUID**. La inserción fallará con un error de tipo.

**El UUID correcto es:** `afdeb5f4-783b-4525-9ddb-ec020fe436f7`

### Solución

Cambiar la llamada en `GuiaVenderEmpresa.tsx` línea 50 para usar el UUID real, o mejor aún, hacer un lookup previo por slug para obtener el UUID dinámicamente (más mantenible).

**Opción recomendada:** Modificar `useLeadMagnetDownloads` para aceptar slug y resolver el UUID internamente:

1. En `useLeadMagnets.tsx`, añadir una función que primero busque el `id` en `lead_magnets` por `landing_page_slug`, y luego inserte en `lead_magnet_downloads` con ese UUID.
2. Alternativamente, usar el UUID directamente como constante en la página (más simple pero menos flexible).

### Otros aspectos revisados (OK)

- **Componentes blog/home/servicio**: `BlogGuideDownloadCTA`, `InlineGuideDownloadBanner`, `GuideDownloadBanner`, `GuideDownloadSection` — todos son links a la landing, no tienen lógica de inserción. Correctos.
- **SEO**: Schema breadcrumb y meta tags correctos.
- **UI**: Coincide con la screenshot del usuario — hero dark, formulario blanco, sección de capítulos. Visualmente correcto.
- **Flujo post-descarga**: Muestra botón de reintento y CTA a calculadora. Correcto.

### Cambios a realizar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useLeadMagnets.tsx` | Modificar `recordDownload` para aceptar slug y resolver UUID vía query |
| `src/pages/recursos/GuiaVenderEmpresa.tsx` | Sin cambios necesarios si el hook se actualiza |

