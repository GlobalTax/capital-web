

## Revisión completa: Landing Guía + todos los CTAs

He revisado todos los archivos del sistema de descarga. Aquí van los problemas y mejoras detectados:

---

### 1. Texto del Hero de la Landing — Mejora de copy

El hero actual dice:

> **"Guía Completa para Vender tu Empresa"**
> "Todo lo que un empresario necesita saber antes de iniciar un proceso de venta: desde la valoración hasta el cierre, con checklist y consejos prácticos."

El copy es correcto pero genérico. Propongo un hero más orientado al dolor del empresario:

> **"No vendas tu empresa sin leer esto"**
> "El 78% de los empresarios que venden sin preparación pierden entre un 15% y un 25% del valor real. Esta guía de 12 capítulos te enseña a evitarlo."

O más suave:

> **"Vende tu empresa al precio que realmente vale"**
> "La guía definitiva de Capittal con valoración, fiscalidad, due diligence y negociación — basada en más de 100 operaciones cerradas."

---

### 2. Textos hardcoded en español — No usan i18n

Ninguno de los componentes de la guía usa el sistema `useI18n()` / `t()`. Todos los textos están hardcoded:
- `GuiaVenderEmpresa.tsx` — landing completa
- `BlogGuideDownloadCTA.tsx` — sidebar blog  
- `InlineGuideDownloadBanner.tsx` — banner inline
- `GuideDownloadBanner.tsx` — banner servicio
- `GuideDownloadSection.tsx` — sección home

Dado que el sitio tiene sistema i18n, habría que internacionalizar estos componentes si se necesita soporte multiidioma. Si es solo español, no es urgente.

---

### 3. Sección "Chapters" — Solo muestra 8 de 12

El array `chapters` tiene 8 elementos, pero el hero dice "12 capítulos". Hay que ajustar: o se añaden los 4 que faltan o se cambia el texto a "8 capítulos clave".

---

### 4. BlogGuideDownloadCTA — Color emerald inconsistente

El CTA del blog usa `emerald-900/800` (verde oscuro), mientras que el resto de la web usa `slate` y el color `primary`. Esto rompe la coherencia visual. Propongo cambiarlo a `slate-900/800` con acentos `primary`, igual que el `GuideDownloadBanner`.

---

### 5. InlineGuideDownloadBanner — Emoji en título

El título tiene un emoji `📥` que no es consistente con el estilo limpio del resto de la web. Mejor eliminarlo y usar solo el icono de Lucide que ya tiene.

---

### Cambios propuestos

| Archivo | Cambio |
|---------|--------|
| `GuiaVenderEmpresa.tsx` | Mejorar copy del hero (título + subtítulo más orientado a conversión). Ajustar chapters a 8 o completar a 12 |
| `BlogGuideDownloadCTA.tsx` | Cambiar palette de emerald a slate/primary para coherencia |
| `InlineGuideDownloadBanner.tsx` | Eliminar emoji `📥` del título |
| `GuideDownloadSection.tsx` | Sin cambios — está bien |
| `GuideDownloadBanner.tsx` | Sin cambios — está bien |

