

## Ajustar PPTX Dealhub para ser fiel a la plantilla

He comparado pixel a pixel las 5 slides de la plantilla con los valores actuales en el codigo. Hay varias diferencias de tamano de fuente, posicionamiento y uso de imagen vs texto.

### Diferencias detectadas

**1. Cover Slide**
- **Branding top-right**: La plantilla usa el LOGO como imagen (no texto "Capittal M&A · Consulting"). Actualmente el codigo renderiza texto porque `logo.visible = false` y `branding.visible = true`. Hay que invertir: usar la imagen del logo y ocultar el texto, o renderizar ambos (logo imagen grande + "M&A · Consulting" debajo)
- **Titulo**: Template usa ~44pt, codigo tiene 36pt
- **Year**: Template parece ~80pt, codigo tiene 72pt -- ajustar a 80

**2. Index Slide**
- **Titulo**: Template usa ~32pt bold, codigo tiene 28pt
- **Intro text**: Template usa ~14pt, codigo tiene 11pt. Ademas el "Apreciado lector," parece estar en linea separada con bold
- **Numeros en cards (01, 02...)**: Template los muestra a ~36pt bold. El codigo actual pone 14pt -- este es el error mas grande
- **Nombres de seccion en cards**: Template ~14pt bold, codigo 13pt
- **Conteo operaciones**: Template ~12pt, codigo 11pt

**3. Separator Slide**
- **Branding top-right**: Igual que cover -- es IMAGEN del logo, no texto. Actualmente renderiza texto
- **Numero**: Template parece ~140-150pt, codigo tiene 120pt

**4. Operation Slide**
- Se ve bastante correcto, sin cambios mayores necesarios

**5. Closing Slide**  
- Se ve correcto en cuanto a estructura. La logo es una imagen (negra sobre blanco)

### Cambios a realizar

**Archivo: `src/features/operations-management/types/slideTemplate.ts`**
- Ajustar `DEFAULT_COVER_TEMPLATE`: yearBlock fontSize 72->80, title fontSize 36->44, logo visible true (para usar imagen), branding como texto pequeno "M&A · Consulting" debajo del logo
- Ajustar `DEFAULT_INDEX_TEMPLATE`: title fontSize 28->32, introText fontSize 11->14
- Ajustar `DEFAULT_SEPARATOR_TEMPLATE`: number fontSize 120->140

**Archivo: `src/features/operations-management/utils/generateDealhubPptx.ts`**
- `addIndexSlide`: cambiar fontSize de numeros en cards de 14 a 36, section labels de 13 a 14, counts de 11 to 12. Ajustar posiciones Y dentro de las cards para acomodar numeros mas grandes
- `addCoverSlide` y `addSectionSeparator`: En el branding, renderizar el logo como imagen (si `logo.imageUrl` existe) + texto "M&A · Consulting" debajo, en vez de solo texto grande
- Ajustar card heights/positions en index si es necesario para que los numeros grandes quepan

### Resumen de cambios de tamano

```text
Elemento                  Actual -> Plantilla
─────────────────────────────────────────────
Cover year                72pt   -> 80pt
Cover title               36pt   -> 44pt
Cover branding            texto  -> logo imagen
Index title               28pt   -> 32pt
Index intro text          11pt   -> 14pt
Index card numbers        14pt   -> 36pt
Index card labels         13pt   -> 14pt
Separator number          120pt  -> 140pt
Separator branding        texto  -> logo imagen
```

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `slideTemplate.ts` | Defaults de fontSize en cover, index, separator |
| `generateDealhubPptx.ts` | fontSize hardcoded en cards del index, logica de branding con imagen |

