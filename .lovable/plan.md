

## Actualizar meta tags estaticos del HTML para la homepage

### Problema
El `<title>` y las meta descriptions estaticas en `index.html` (lineas 7-8, 36-39) siguen con los valores genericos antiguos:
- Title: "Capittal - Especialistas en Fusiones y Adquisiciones"
- Description: "Capittal es su socio estrategico en operaciones de M&A..."

El script JS los actualiza correctamente al ejecutarse, pero el HTML fuente inicial muestra los valores viejos. Esto afecta a crawlers que no ejecutan JS y a las previsualizaciones de redes sociales.

### Solucion
Actualizar los 6 valores estaticos en `index.html` para que coincidan con los de la ruta `/` en el mapa `R`:

| Linea | Atributo | Valor actual | Nuevo valor |
|-------|----------|-------------|-------------|
| 7 | `<title>` | Capittal - Especialistas en Fusiones y Adquisiciones | Capittal Transacciones \| Fusiones y Adquisiciones en Espana - M&A Advisory |
| 8 | `meta description` | Capittal es su socio estrategico... | Firma de asesoramiento en fusiones y adquisiciones (M&A) en Barcelona. +70 profesionales especializados en venta de empresas, valoraciones y due diligence. Sectores: seguridad privada, tecnologia e industrial. |
| 36 | `og:title` | (mismo antiguo) | (mismo nuevo title) |
| 37 | `twitter:title` | (mismo antiguo) | (mismo nuevo title) |
| 38 | `og:description` | (mismo antiguo) | (misma nueva description) |
| 39 | `twitter:description` | (mismo antiguo) | (misma nueva description) |

### Detalles tecnicos
- Solo se modifica `index.html`, lineas 7-8 y 36-39
- Los valores pasan a coincidir exactamente con la entrada `"/"` del mapa `R`
- El script JS sigue funcionando igual (sobreescribe con los mismos valores en homepage, y con valores especificos en otras rutas)
- Sin nuevas dependencias ni cambios en componentes React
