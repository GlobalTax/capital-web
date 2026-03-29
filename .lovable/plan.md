

## Plan: Corregir ai-content-studio para que use Claude como modelo principal

### Diagnóstico
El test end-to-end confirmó que `ai-content-studio` funciona correctamente (responde 200 con contenido generado), pero el modelo usado fue **gpt-4o-mini** en lugar de Claude.

**Causa**: En `supabase/functions/ai-content-studio/index.ts` línea 42, la configuración incluye `preferOpenAI: true`, lo que hace que `callAI()` priorice OpenAI antes de intentar Claude (ver `ai-helper.ts` líneas 358-369).

### Cambio

**Archivo: `supabase/functions/ai-content-studio/index.ts`** (línea 42)
- Eliminar `preferOpenAI: true` de la configuración de `callAI()`
- Esto hará que siga el flujo por defecto: **Claude → Lovable AI → OpenAI**

### Alcance adicional
Buscar si hay otras Edge Functions que también usen `preferOpenAI: true` y corregirlas para que Claude sea el modelo principal en todas.

### Resultado esperado
Al repetir el test, el campo `model` en la respuesta debería mostrar `claude-sonnet-4-20250514` en lugar de `gpt-4o-mini`.

