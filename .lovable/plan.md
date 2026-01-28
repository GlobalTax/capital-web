

# Plan: Traducir Automáticamente Operaciones con IA

## Resumen

Las columnas y la lógica de traduccion ya estan implementadas, pero los campos `description_en`, `short_description_en` y `highlights_en` estan vacios. Voy a crear una Edge Function que traduzca automaticamente todas las operaciones usando IA.

---

## Solucion

### Fase 1: Crear Edge Function `translate-operations`

Nueva funcion que:
1. Obtiene operaciones sin traduccion (`description_en IS NULL`)
2. Traduce cada operacion al ingles usando Lovable AI Gateway
3. Actualiza la base de datos con las traducciones
4. Devuelve un resumen de las traducciones realizadas

### Fase 2: Ejecutar la traduccion

Invocar la funcion para poblar todas las traducciones de golpe.

---

## Archivos a Crear

| Archivo | Descripcion |
|---------|-------------|
| `supabase/functions/translate-operations/index.ts` | Edge Function para traducir operaciones |

---

## Seccion Tecnica

### Estructura de la Edge Function

```typescript
// translate-operations/index.ts

// 1. Parametros de entrada (opcionales)
interface TranslateRequest {
  operation_id?: string;  // Traducir una operacion especifica
  limit?: number;         // Limitar cantidad (default: 10)
  target_language?: string; // 'en' o 'ca' (default: 'en')
}

// 2. Flujo principal
// - Consultar operaciones sin traduccion
// - Para cada operacion:
//   - Enviar descripcion + short_description + highlights a la IA
//   - Recibir traducciones
//   - UPDATE en company_operations
// - Retornar resumen

// 3. Prompt de traduccion
const systemPrompt = `You are a professional translator for M&A content.
Translate the following company descriptions to English.
Maintain professional business tone and M&A terminology.
Keep company/project names as-is.
Return JSON with: description, short_description, highlights (array)`;
```

### Llamada a Lovable AI Gateway

```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({
        description: op.description,
        short_description: op.short_description,
        highlights: op.highlights
      })}
    ],
    temperature: 0.3,
    max_tokens: 2000,
  }),
});
```

### Actualizacion en BD

```typescript
await supabase
  .from('company_operations')
  .update({
    description_en: translated.description,
    short_description_en: translated.short_description,
    highlights_en: translated.highlights
  })
  .eq('id', operation.id);
```

### Invocacion

```bash
# Traducir 10 operaciones al ingles
POST /functions/v1/translate-operations
{ "limit": 10, "target_language": "en" }

# Traducir una operacion especifica
POST /functions/v1/translate-operations
{ "operation_id": "uuid-here" }

# Traducir todas (con limite alto)
POST /functions/v1/translate-operations
{ "limit": 100 }
```

---

## Impacto

| Metrica | Valor |
|---------|-------|
| Archivos nuevos | 1 |
| Operaciones a traducir | 91 |
| Tiempo estimado por operacion | ~2 segundos |
| Tiempo total estimado | ~3 minutos |
| Riesgo | Bajo (solo añade datos, no modifica existentes) |

---

## Resultado Esperado

Despues de ejecutar la funcion:
1. Campos `description_en`, `short_description_en`, `highlights_en` poblados
2. Las cards en `/oportunidades` mostraran contenido en ingles automaticamente
3. El sector ya funciona (usa la tabla `sectors`)

