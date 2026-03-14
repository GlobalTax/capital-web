

## Problema: Ahrefs no detecta el script de analytics

Ahrefs muestra "Script isn't found" porque el script se carga dinámicamente vía JavaScript en `TrackingInitializer.tsx`. El verificador de Ahrefs no ejecuta JavaScript del lado del cliente, así que nunca lo encuentra.

## Solución

Añadir el snippet de Ahrefs directamente como `<script>` estático en el `<head>` de `index.html`, tal como indica la guía de instalación de Ahrefs. Mantener la protección contra duplicados en `TrackingInitializer.tsx` (que ya comprueba `getElementById`).

### Cambios

**`index.html`** — Añadir después de la línea del favicon (~línea 14):
```html
<script src="https://analytics.ahrefs.com/analytics.js" data-key="VouNMjijNalPNS/dBxC7Fw" async></script>
```

**`src/components/TrackingInitializer.tsx`** — Sin cambios necesarios (el guard `getElementById('ahrefs-analytics')` evitará duplicados, pero como el tag estático no tiene ese `id`, conviene añadirlo o simplemente eliminar el bloque dinámico de Ahrefs de TrackingInitializer para evitar carga doble). Se eliminará el bloque de Ahrefs (líneas 327-336).

### Resultado

El script estará visible en el HTML estático para el verificador de Ahrefs. Tras publicar, pulsar "Recheck installation" en Ahrefs para confirmar.

