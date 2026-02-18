

# Fix: Logo invisible en PDFs (logo blanco sobre fondo blanco)

## Problema

La URL actual (`capittal-logo-white.png`) es un logo blanco para fondos oscuros. Se descarga correctamente, se embebe en el PDF, pero no se ve porque el fondo del PDF es blanco.

## Solucion

1. **Subir el logo oscuro** (`src/assets/logotipo.png`) al bucket publico de Supabase Storage para que sea accesible via URL desde la Edge Function.

2. **Cambiar la URL en la Edge Function** de `capittal-logo-white.png` a la nueva URL del logo oscuro en Supabase Storage.

## Cambios tecnicos

### Paso 1: Copiar logo a public/ para subirlo

Copiar `src/assets/logotipo.png` al bucket de Supabase Storage (e.g., `public` bucket o usar la URL de la web publicada `https://webcapittal.lovable.app/logotipo.png`).

Alternativa mas simple: copiar `logotipo.png` a la carpeta `public/` del proyecto para que sea accesible en la URL publicada.

### Paso 2: Actualizar URL en Edge Function

| Archivo | Cambio |
|---|---|
| `supabase/functions/send-valuation-email/index.ts` (linea 680) | Cambiar URL de `capittal-logo-white.png` a la URL del logo oscuro |

```text
// ANTES
const logoUrl = 'https://capittal.es/lovable-uploads/capittal-logo-white.png';

// DESPUES  
const logoUrl = 'https://webcapittal.lovable.app/logotipo.png';
```

### Paso 3: Verificar formato

El `logotipo.png` es un PNG. El codigo ya usa `embedPng()`, asi que es compatible. Si el archivo tuviera fondo transparente, se vera correctamente sobre blanco (letras oscuras visibles).

## Archivos modificados

- `public/logotipo.png` (copiar desde src/assets/ para accesibilidad publica)
- `supabase/functions/send-valuation-email/index.ts` (1 linea: cambiar URL del logo)

## Verificacion

Redesplegar la Edge Function y enviar una valoracion de prueba para confirmar que el logo oscuro aparece en los encabezados de ambos PDFs.
