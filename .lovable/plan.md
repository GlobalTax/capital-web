

## Plan: Corregir el parser de ofertas de trabajo (pegar y autocompletar)

### Problema

Cuando pegas una oferta de trabajo y pulsas "Analizar y Completar", la IA procesa correctamente el texto (devuelve 200 OK y muestra el toast "Oferta analizada"), pero los campos del formulario no se rellenan.

La causa esta en la edge function `generate-job-offer-ai`. El tipo `parse` cae en la rama generica (`else`) que envuelve la respuesta como `{ content: "...json string..." }` en lugar de parsear el JSON como hace el tipo `full`. Asi que `JobPasteParser` recibe `result.content` (un string JSON) en vez de `result.title`, `result.requirements`, etc., y todas las comprobaciones `if (result.title)` fallan silenciosamente.

### Solucion

Modificar la edge function para que el tipo `parse` parsee el JSON de la respuesta de la IA, igual que hace el tipo `full`.

### Cambio en `supabase/functions/generate-job-offer-ai/index.ts`

Lineas 243-252: Cambiar la logica de procesamiento para incluir `parse` junto con `full`:

```text
// Antes (linea 243):
} else if (type === 'full') {

// Despues:
} else if (type === 'full' || type === 'parse') {
```

Esto hace que la respuesta del tipo `parse` pase por `JSON.parse(generatedContent)` y devuelva los campos directamente en el objeto, en lugar de envolverlos como string dentro de `content`.

### Archivo a modificar

- `supabase/functions/generate-job-offer-ai/index.ts` (linea 243, anadir `|| type === 'parse'`)

