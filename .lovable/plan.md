

## Plan: Acortar meta descriptions a ≤155 caracteres

### Alcance

1. **Homepage** (`/`): Cambiar la `d` a exactamente: `Asesoramiento M&A en Barcelona: venta de empresas, valoraciones y due diligence. +70 profesionales especializados en mid-market español.`
   - También actualizar la misma descripción en las 3 ubicaciones estáticas del `<head>` (líneas 8, 40, 41).

2. **Todas las demás rutas del objeto `R`**: Revisar cada una de las ~120 descripciones y recortar las que excedan 155 caracteres, manteniendo el mensaje clave y las keywords principales.

### Rutas con descriptions que exceden 155 caracteres (ejemplos detectados)

- `/venta-empresas` (187 chars) → recortar
- `/compra-empresas` (186 chars) → recortar
- `/servicios/valoraciones` (189 chars) → recortar
- `/servicios/due-diligence` (183 chars) → recortar
- `/servicios/planificacion-fiscal` (172 chars) → recortar
- `/sectores/seguridad` (213 chars) → recortar
- `/sectores/tecnologia` (171 chars) → recortar
- `/recursos/blog` (168 chars) → recortar
- `/lp/calculadora` (155+ chars) → ajustar
- Y prácticamente todas las rutas en catalán, inglés y castellano con textos largos

### Criterio de recorte

- Mantener keywords principales (sector, servicio, "Capittal", "M&A", "España/Barcelona")
- Priorizar call-to-action o propuesta de valor
- Cortar frases secundarias o redundantes
- Máximo estricto: 155 caracteres

### Archivos a modificar

- `index.html` — líneas 8, 40, 41 (meta tags estáticos) y líneas 46-162 (objeto `R` del script SEO)

