

## Cambiar todos los titulos de la home a negro

### Problema

Varias secciones de la pagina principal usan `text-muted-foreground` (gris) en titulos, subtitulos y etiquetas de seccion. Segun el estandar tipografico, deben usar negro (`text-foreground`).

### Cambios por archivo

**1. `src/components/home/LaFirmaSection.tsx`**

| Linea | Elemento | De | A |
|-------|----------|-----|-----|
| 34 | Etiquetas de stats ("Valor asesorado", etc.) | `text-muted-foreground` | `text-foreground/70` |
| 53 | Etiqueta de seccion "La Firma" | `text-muted-foreground/60` | `text-foreground/60` |
| 59 | Subtitulo "desde 2008" dentro del h2 | `text-muted-foreground` | `text-foreground` |
| 90 | Parrafo descriptivo principal | `text-muted-foreground` | `text-foreground/80` |
| 93 | Segundo parrafo descriptivo | `text-muted-foreground/80` | `text-foreground/70` |
| 101 | Texto "Maxima discrecion..." | `text-muted-foreground` | `text-foreground/70` |
| 105 | Texto "Asesoramiento objetivo..." | `text-muted-foreground` | `text-foreground/70` |

**2. `src/components/home/PracticeAreasSection.tsx`**

| Linea | Elemento | De | A |
|-------|----------|-----|-----|
| 103 | Etiqueta de seccion "Areas de practica" | `text-muted-foreground/60` | `text-foreground/60` |
| 172 | Texto CTA "Necesitas asesoramiento..." | `text-muted-foreground` | `text-foreground/80` |

**3. `src/components/home/MANewsSection.tsx`**

| Linea | Elemento | De | A |
|-------|----------|-----|-----|
| 94 | Subtitulo "Mantente informado..." | `text-muted-foreground` | `text-foreground/70` |

### Nota

Los textos de cuerpo pequeno dentro de tarjetas (excerpts de noticias, fechas, fuentes) y los elementos de UI del admin se mantienen en gris ya que son informacion secundaria, no titulos. Solo se cambian los titulos, subtitulos y textos destacados de las secciones publicas de la home.

