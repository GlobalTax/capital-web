

# Fix: Generación de imágenes para recursos

## Problema identificado

El modelo de IA está mal referenciado. La función `generate-resource-image` usa `google/gemini-2.5-flash-image` pero el modelo correcto (usado en `generate-newsletter-image` que sí funciona) es `google/gemini-2.5-flash-image-preview`.

Los logs solo muestran llamadas de test con IDs inválidos — la función está desplegada pero el modelo incorrecto haría que falle cuando se use con un ID real.

## Cambio

1. **Corregir modelo en `supabase/functions/generate-resource-image/index.ts`**: Cambiar `google/gemini-2.5-flash-image` → `google/gemini-2.5-flash-image-preview` (línea 60)
2. **Redesplegar** la edge function

## Después

Ve al panel admin `/admin/lead-magnets`, busca "Guía Completa para Vender tu Empresa" y pulsa el botón "Generar imagen con IA". La imagen debería generarse y aparecer automáticamente en la biblioteca.

