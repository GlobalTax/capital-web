

## Plan: Incorporar recurso "Constitución de sociedades holding" a la biblioteca

### Resumen
Subir el PDF al storage de Supabase e insertar un registro en `lead_magnets` para que aparezca en la biblioteca de recursos (`/recursos/biblioteca`) con su landing page de descarga gated.

### Pasos

**1. Subir el PDF al bucket de storage**
- Copiar `guia-constituir-holding-venta-empresa.pdf` al proyecto
- Subirlo al bucket existente (probablemente `campaign-presentations` o crear una ruta en el bucket usado por la guía existente)
- Verificar que el bucket tiene políticas de lectura pública

**2. Insertar registro en `lead_magnets`**
SQL migration con estos datos:
- **title**: "Constitución de Sociedades Holding en Operaciones de Compraventa"
- **type**: `whitepaper` (análisis técnico-legal con normativa y doctrina)
- **sector**: `fiscal`
- **description**: "Análisis técnico-legal sobre la constitución de holdings pre-venta: régimen FEAC, cláusula anti-abuso (art. 89.2 LIS), doctrina del TEAC 2024-2025, riesgos de inspección y ejemplo numérico de tributación."
- **landing_page_slug**: `guia-holding-venta-empresa`
- **file_url**: ruta al PDF en storage
- **status**: `active`
- **meta_title**: "Guía Holding Pre-Venta: Régimen FEAC, Riesgos y Ejemplo Numérico [2026]"
- **meta_description**: "Análisis de la constitución de sociedades holding antes de vender una empresa. Régimen FEAC, cláusula anti-abuso art. 89.2 LIS, doctrina TEAC 2024-2025 y ejemplo numérico con y sin holding."

**3. Contenido de la landing page**
El sistema ya genera la landing page automáticamente en `/recursos/biblioteca/guia-holding-venta-empresa` usando el componente `ResourceLandingPage`. Se mostrará con el diseño split (texto + formulario gate) existente. El campo `content` se rellenará con los puntos clave del documento para la parte izquierda de la landing.

### Resultado
- Aparecerá en la biblioteca filtrable como tipo "Whitepaper"
- Landing page con formulario de captura de leads antes de la descarga
- PDF servido desde Supabase Storage

