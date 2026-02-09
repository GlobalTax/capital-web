

## Fix: Video del Hero no se ve bien en movil

### Problema

El Hero usa `h-screen` para la altura, lo cual es problematico en movil (especialmente iOS Safari) porque la barra de direcciones cambia dinamicamente el viewport height. Esto causa que el video se recorte mal, se vea con escalado incorrecto, o deje espacios en blanco.

### Cambios en `src/components/Hero.tsx`

**1. Reemplazar `h-screen` por `h-dvh` (dynamic viewport height)**

La clase `h-screen` equivale a `100vh`, que en iOS Safari incluye el area detras de la barra de direcciones. `h-dvh` usa `100dvh` que se ajusta dinamicamente al viewport visible real. Tailwind CSS ya soporta `h-dvh`.

- Linea 159: Cambiar `h-screen` por `min-h-dvh` en el `<section>`

**2. Asegurar que el video cargue correctamente en movil**

Agregar atributos adicionales al elemento `<video>` para mejorar compatibilidad movil:

- Linea 173-180: Anadir `preload="auto"` y `webkit-playsinline` para mejor soporte en iOS Safari antiguo
- Anadir handler `onCanPlay` para asegurar que el video se muestre correctamente

**3. Ajustar overlays para mejor legibilidad en movil**

Segun el estandar definido en el proyecto, los overlays en movil deben ser mas opacos para garantizar contraste:

- Linea 181: El overlay del video usa clases genericas. Anadir variantes responsive: en desktop `from-foreground/70` y en movil `from-foreground/80` para mejor legibilidad del texto sobre el video

### Resumen de cambios

| Linea | Antes | Despues |
|-------|-------|---------|
| 159 | `h-screen` | `min-h-dvh` |
| 173-180 | `<video>` basico | `<video>` con `preload="auto"` y atributos iOS |
| 181 | overlay fijo | overlay responsive (mas opaco en movil) |

### Archivo afectado

- `src/components/Hero.tsx`
