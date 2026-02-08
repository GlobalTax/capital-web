
## Plan: LinkedIn Newsletter Content Studio para Samuel Navarro

Crear una nueva seccion dedicada en el admin para generar contenido de tu newsletter de LinkedIn, con tu voz y estilo exacto codificados en el sistema.

### Que se va a construir

**1. Nueva Edge Function: `generate-linkedin-newsletter`**

Una funcion backend dedicada que usa Lovable AI (Gemini) con un system prompt extenso que codifica tu voz:
- Conversacional con autoridad
- Anecdotas personales y casos reales
- Datos concretos (facturacion, ROI, numeros)
- Metaforas culturales inesperadas (Peret, Reyes Magos, Ironman)
- Sin listas ni bullets excesivos en el cuerpo principal
- Cierre con reflexion o CTA claro

La funcion tendra 3 modos:
- **`ideation`**: Genera 5 ideas de contenido especificas (no genericas) basadas en tendencias M&A, tech legal, y tu angulo personal
- **`draft`**: Genera un borrador completo de newsletter con tu voz
- **`review`**: Recibe un borrador tuyo y da feedback brutal y honesto (estructura, engagement, CTA, datos)

**2. Nueva pagina: `LinkedInNewsletterStudio.tsx`**

Interfaz con 3 tabs:

- **Ideas**: Boton para generar ideas. Muestra 5 ideas con titulo, angulo y hook. Boton para convertir idea en borrador.
- **Escribir**: Editor de texto donde escribes o generas un borrador. Selector de tema/idea. Boton "Generar borrador con IA". Preview del resultado con formato LinkedIn.
- **Revisar**: Pega un borrador tuyo. Boton "Feedback brutal". Muestra analisis con puntuacion (engagement, datos, CTA, voz) y sugerencias concretas.

**3. Navegacion**

Anadir entrada en `navigationData.ts` dentro del grupo de contenido, con icono y badge "AI".

### Detalle tecnico

**Edge Function** (`supabase/functions/generate-linkedin-newsletter/index.ts`):
- Usa Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`)
- Modelo: `google/gemini-3-flash-preview`
- System prompt con tu perfil completo, ejemplos de tu estilo, y reglas de formato
- 3 endpoints internos segun `mode`: ideation, draft, review
- Manejo de errores 429/402

**Hook** (`src/hooks/useLinkedInNewsletter.ts`):
- Invoca la edge function via `supabase.functions.invoke`
- Estado de loading por modo
- Almacena historial de ideas y borradores en estado local

**Pagina** (`src/pages/admin/LinkedInNewsletterStudio.tsx`):
- Tabs: Ideas | Escribir | Revisar
- Textarea para input del usuario
- Renderizado markdown del output con `react-markdown`
- Boton copiar al portapapeles para pegar directo en LinkedIn

**Archivos a crear:**
- `supabase/functions/generate-linkedin-newsletter/index.ts`
- `src/hooks/useLinkedInNewsletter.ts`
- `src/pages/admin/LinkedInNewsletterStudio.tsx`

**Archivos a modificar:**
- `src/components/admin/navigation/navigationData.ts` (nueva entrada)
- `src/components/admin/AdminApp.tsx` (nueva ruta)
