

# Plan: Importación Inteligente de Google Ads con IA (Screenshot)

## Contexto

Ya existe un sistema funcional para importar pantallazos de campañas publicitarias:
- **Edge Function**: `parse-campaign-screenshot` (usa OpenAI GPT-4o)
- **Componentes UI**: `ScreenshotUploader`, `PasteImageProcessor`
- **Integración**: `CostEntryForm` con botón "Importar pantallazo"

Sin embargo, la imagen de Google Ads que compartiste muestra un formato específico:
- **Conversiones**: 25,00
- **Clics**: 791
- **CTR**: 13,87%
- **Coste**: 3,25 mil € (formateado como "mil" en español)
- **Rango de fechas**: 1 ene 2026 - 31 ene 2026

## Mejoras Propuestas

### 1. Optimizar Edge Function para Google Ads

Actualizar el prompt de IA para detectar mejor los formatos específicos de Google Ads:

| Campo | Formato Meta Ads | Formato Google Ads |
|-------|-----------------|-------------------|
| Gasto | €1.234,56 | 3,25 mil € |
| Resultados | Resultados | Conversiones |
| Clics | Clics en el enlace | Clics |
| Período | Fechas específicas | "1 ene 2026 - 31 ene 2026" |

**Cambios en el prompt**:
```text
- Reconocer "mil €" como multiplicador (3,25 mil € = €3.250)
- Extraer "Conversiones" como campo específico (además de "Resultados")
- Parsear fechas en formato "1 ene 2026" a YYYY-MM-DD
- Detectar automáticamente plataforma Google Ads por colores/layout
```

### 2. Migrar a Lovable AI Gateway

Cambiar de OpenAI directo a Lovable AI para:
- Usar `LOVABLE_API_KEY` (ya configurado)
- Modelo: `google/gemini-2.5-flash` (más rápido y con buen soporte multimodal)
- Eliminar dependencia de `OPENAI_API_KEY`

### 3. Extender Interface de Datos Extraídos

Añadir campo `conversions` específico para Google Ads:

```typescript
export interface ExtractedCampaignData {
  channel: 'meta_ads' | 'google_ads' | 'linkedin_ads';
  campaign_name: string | null;
  period_start: string;
  period_end: string;
  amount: number;
  currency: 'EUR' | 'USD';
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  confidence: number;
  detected_text: string;
  
  // NUEVOS - Específicos Google Ads
  conversions: number | null;    // Conversiones (no "results")
  cost_per_conversion: number | null;
}
```

### 4. Actualizar UI para Mostrar Conversiones

En `ScreenshotUploader` y `PasteImageProcessor`, mostrar el campo "Conversiones" cuando el canal sea Google Ads.

---

## Arquitectura de la Solución

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUJO DE IMPORTACIÓN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Usuario sube/pega screenshot de Google Ads                              │
│                        │                                                    │
│                        ▼                                                    │
│  ┌─────────────────────────────────────┐                                    │
│  │   ScreenshotUploader.tsx            │                                    │
│  │   - Convierte imagen a base64       │                                    │
│  │   - Valida tamaño (máx 4MB)         │                                    │
│  └─────────────────────────────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│  ┌─────────────────────────────────────┐                                    │
│  │   Edge Function:                    │                                    │
│  │   parse-campaign-screenshot         │                                    │
│  │                                     │                                    │
│  │   - Usa Lovable AI Gateway          │                                    │
│  │   - Modelo: gemini-2.5-flash        │                                    │
│  │   - Prompt optimizado Google Ads    │                                    │
│  └─────────────────────────────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│  ┌─────────────────────────────────────┐                                    │
│  │   Datos Extraídos:                  │                                    │
│  │   - channel: "google_ads"           │                                    │
│  │   - conversions: 25                 │                                    │
│  │   - clicks: 791                     │                                    │
│  │   - amount: 3250                    │                                    │
│  │   - period: 2026-01-01 → 2026-01-31 │                                    │
│  └─────────────────────────────────────┘                                    │
│                        │                                                    │
│                        ▼                                                    │
│  ┌─────────────────────────────────────┐                                    │
│  │   CostEntryForm.tsx                 │                                    │
│  │   - Auto-rellena formulario         │                                    │
│  │   - Usuario confirma y guarda       │                                    │
│  │   → ads_costs_history               │                                    │
│  └─────────────────────────────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Archivos a Modificar

### Edge Function

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/parse-campaign-screenshot/index.ts` | Migrar a Lovable AI, optimizar prompt para Google Ads |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/campaigns/ScreenshotUploader.tsx` | Añadir campo "Conversiones" en preview |
| `src/components/admin/campaigns/PasteImageProcessor.tsx` | Mostrar conversiones para Google Ads |
| `src/components/admin/campaigns/CostEntryForm.tsx` | Mapear conversions a campo del formulario |

### Tipos

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/campaigns/ScreenshotUploader.tsx` | Extender `ExtractedCampaignData` con conversions |

---

## Detalles Técnicos

### Nuevo Prompt Optimizado

```text
Analiza pantallazos de Meta Ads y Google Ads.

FORMATOS ESPECÍFICOS DE GOOGLE ADS:
- Los montos pueden usar "mil" como multiplicador: "3,25 mil €" = 3250 EUR
- Busca "Conversiones" en lugar de "Resultados"
- Las fechas pueden estar en formato "1 ene 2026" o "Jan 1, 2026"
- El layout usa colores rojo/amarillo/verde para métricas principales

CAMPOS A EXTRAER:
- channel: "google_ads" si ves "Conversiones", "Clics", "CTR" en layout Google
- conversions: número de conversiones (puede tener decimales como 25,00)
- clicks: número de clics
- ctr: porcentaje CTR (ej: 13,87)
- amount: gasto total (convertir "mil" a número completo)
- period_start/end: fechas del rango mostrado

RESPUESTA JSON:
{
  "channel": "google_ads",
  "campaign_name": null,
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  "amount": 3250,
  "currency": "EUR",
  "conversions": 25,
  "clicks": 791,
  "ctr": 13.87,
  "impressions": null,
  "cpc": null,
  "confidence": 0.95,
  "detected_text": "Conversiones: 25, Clics: 791, CTR: 13,87%, Coste: 3,25 mil €"
}
```

### Estructura de la Edge Function Actualizada

```typescript
// Usar Lovable AI Gateway en lugar de OpenAI directo
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LOVABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: [
        { type: 'text', text: userPrompt },
        { type: 'image_url', image_url: { url: imageBase64 } }
      ]}
    ],
    max_tokens: 1000,
    temperature: 0.1
  }),
});
```

---

## Beneficios

1. **Soporte Nativo Google Ads**: Extracción correcta de "Conversiones", formatos "mil €", fechas españolas
2. **Lovable AI**: Usa el gateway centralizado con `LOVABLE_API_KEY` ya configurado
3. **Modelo Optimizado**: Gemini 2.5 Flash es rápido y excelente para análisis de imágenes
4. **Retrocompatible**: Meta Ads sigue funcionando igual
5. **Flujo Integrado**: Los datos van directo al sistema unificado `ads_costs_history`

---

## Validación Post-Implementación

Con la imagen de ejemplo que compartiste:
- **Input**: Screenshot con "Conversiones: 25,00 | Clics: 791 | CTR: 13,87% | Coste: 3,25 mil €"
- **Output esperado**:
  ```json
  {
    "channel": "google_ads",
    "period_start": "2026-01-01",
    "period_end": "2026-01-31",
    "amount": 3250,
    "conversions": 25,
    "clicks": 791,
    "ctr": 13.87,
    "currency": "EUR",
    "confidence": 0.9
  }
  ```

